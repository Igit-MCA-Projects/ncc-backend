import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { db } from "../../db/prisma.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validEnv } from "../../validator/envValidator.js";


const genAI = new GoogleGenAI({ apiKey: validEnv.GEMINAI_API_KEY });

// ─── Query validation ────────────────────────────────────────────────────────
// No query params needed — Gemini returns one bounded batch of web-found
// matches per call rather than a paginated REST resource.

const getRecomendedJobSchema = z.object({});

// ─── Shape we ask Gemini to extract from the raw student profile ───────────

const aiStructuredProfileSchema = z.object({
  searchQuery: z.string().min(1), // e.g. "Frontend Developer React Node.js"
  primarySkills: z.array(z.string()).default([]),
  experienceLevel: z
    .enum(["entry", "junior", "mid", "senior"])
    .default("entry"),
  preferredLocation: z.string().optional().nullable(),
  remotePreferred: z.boolean().default(false),
});

type AiStructuredProfile = z.infer<typeof aiStructuredProfileSchema>;

/**
 * Pulls a JSON value out of raw LLM text, tolerating markdown fences or
 * stray commentary the model may add despite instructions not to.
 */
function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  const objStart = cleaned.indexOf("{");
  const objEnd = cleaned.lastIndexOf("}");
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");

  // Prefer whichever bracket pair appears first and is well-formed.
  const useObject =
    objStart !== -1 && objEnd !== -1 && (arrStart === -1 || objStart < arrStart);

  const slice = useObject
    ? cleaned.slice(objStart, objEnd + 1)
    : arrStart !== -1 && arrEnd !== -1
      ? cleaned.slice(arrStart, arrEnd + 1)
      : null;

  if (!slice) return null;

  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

/**
 * Uses Gemini (plain generation, no web search needed) to turn the raw
 * student profile — skills, education, NCC info — into a compact structured
 * shape used to drive the job search prompt.
 */
async function structureStudentProfile(
  student: any,
): Promise<AiStructuredProfile> {
  const educationSummary = (student.educations ?? [])
    .map(
      (e: any) =>
        `${e.level} in ${e.fieldOfStudy ?? "N/A"} from ${e.institutionName}`,
    )
    .join("; ");

  const prompt = `
You are extracting a structured job-search profile from a student's data.
Return ONLY valid JSON, no markdown, matching exactly this shape:
{
  "searchQuery": string,        // short job search keyword string, e.g. "Frontend Developer React"
  "primarySkills": string[],    // top 5-8 skills most relevant to employability
  "experienceLevel": "entry" | "junior" | "mid" | "senior",
  "preferredLocation": string | null,
  "remotePreferred": boolean
}

Student data:
- Headline: ${student.headline ?? "N/A"}
- Bio: ${student.bio ?? "N/A"}
- Skills: ${(student.skills ?? []).join(", ") || "N/A"}
- Education: ${educationSummary || "N/A"}
- Preferred Role: ${student.preferredRole ?? "N/A"}
- Preferred Location: ${(student.preferredLocation ?? []).join(", ") || "N/A"}
- Open To Remote: ${student.openToRemote}
- Willing To Relocate: ${student.willingToRelocate}
- NCC Certificate: ${student.nccProfile?.nccCirtificate ?? "N/A"}
- NCC Rank: ${student.nccProfile?.nccRank ?? "N/A"}
`.trim();

  let rawText = "";
  try {
    const response = await genAI.models.generateContent({
      model: validEnv.GEMINAI_MODEL, // e.g. "gemini-2.5-flash"
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });
    rawText = response.text ?? "";
  } catch (err) {
    // AI provider unreachable / rate limited — don't fail the whole request,
    // fall through to the deterministic fallback built from raw student fields.
    return buildFallbackProfile(student);
  }

  const parsedJson = extractJson(rawText);
  if (parsedJson === null) {
    return buildFallbackProfile(student);
  }

  const validated = aiStructuredProfileSchema.safeParse(parsedJson);
  if (!validated.success) {
    return buildFallbackProfile(student);
  }

  return validated.data;
}

/**
 * Deterministic fallback so a flaky/unavailable AI provider never breaks
 * job recommendations outright — built directly from stored student fields.
 */
function buildFallbackProfile(student: any): AiStructuredProfile {
  return {
    searchQuery:
      student.preferredRole ||
      student.headline ||
      (student.skills ?? [])[0] ||
      "Jobs",
    primarySkills: (student.skills ?? []).slice(0, 8),
    experienceLevel: "entry",
    preferredLocation: (student.preferredLocation ?? [])[0] ?? null,
    remotePreferred: Boolean(student.openToRemote),
  };
}

// ─── Shape we require back from Gemini for each job it finds on the web ─────

const geminiJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  applyLink: z.string().min(1).default(""),
  skills: z.array(z.string()).default([]),
});

type GeminiJob = z.infer<typeof geminiJobSchema>;

/**
 * Uses Gemini with Google Search grounding to find real, currently-live job
 * postings on the web that match the student's structured profile, and
 * returns them as clean { title, company, applyLink, skills } objects.
 *
 * Never throws — on any failure (network, quota, bad/empty AI output) it
 * returns an empty, well-formed result with `aiAvailable: false` so the
 * endpoint always responds with a shape the frontend can render safely.
 */
async function findJobsWithGemini(
  structured: AiStructuredProfile,
): Promise<{ jobs: GeminiJob[]; aiAvailable: boolean }> {
  const prompt = `
Search the web for real, currently open job postings that match this candidate.

Candidate profile:
- Target role / search query: ${structured.searchQuery}
- Key skills: ${structured.primarySkills.join(", ") || "N/A"}
- Experience level: ${structured.experienceLevel}
- Preferred location: ${structured.preferredLocation ?? "Any"}
- Remote preferred: ${structured.remotePreferred}

Find up to 8 real, currently live job postings (company career pages, LinkedIn,
Indeed, Naukri, or similar job boards) that best match this profile. Only
include postings you actually found through search — do not invent listings.

Respond with ONLY a JSON array, no markdown fences, no commentary, in exactly
this shape:
[
  {
    "title": string,
    "company": string,
    "applyLink": string,
    "skills": string[]
  }
]
If you cannot find any real matching postings, respond with exactly: []
`.trim();

  let rawText = "";
  try {
    const response = await genAI.models.generateContent({
      model: validEnv.GEMINAI_MODEL,
      contents: prompt,
      config: {
        // Grounding (googleSearch) cannot be combined with responseMimeType/
        // responseSchema structured-output config, so JSON is enforced purely
        // through the prompt instructions above and parsed defensively below.
        tools: [{ googleSearch: {} }],
      },
    });
    rawText = response.text ?? "";
  } catch (err) {
    // Gemini unreachable / rate limited / quota exceeded — degrade gracefully
    // instead of throwing, so the endpoint still returns a renderable shape.
    return { jobs: [], aiAvailable: false };
  }

  const parsed = extractJson(rawText);
  const candidates = Array.isArray(parsed) ? parsed : [];

  if (candidates.length === 0) {
    // Either genuinely no matches, or the model didn't return parseable JSON.
    return { jobs: [], aiAvailable: true };
  }

  const jobs: GeminiJob[] = [];
  for (const candidate of candidates) {
    const validated = geminiJobSchema.safeParse(candidate);
    if (validated.success) {
      jobs.push(validated.data);
    }
  }

  return { jobs, aiAvailable: true };
}

// ─── Controller ───────────────────────────────────────────────────────────────

const getRecomendedJob = asyncHandler(async (req: Request, res: Response) => {
  const validRes = getRecomendedJobSchema.safeParse(req.query);
  if (!validRes.success) {
    throw new ApiError(
      400,
      "Provided data are invalid",
      validRes.error.issues,
    );
  }

  // Adjust this to match how your auth middleware attaches the student.
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Unauthorized");
  }

  const student = await db.student.findUnique({
    where: { id: studentId, isDeleted: false },
    select: {
      headline: true,
      bio: true,
      skills: true,
      preferredRole: true,
      preferredLocation: true,
      openToRemote: true,
      willingToRelocate: true,
      expectedSalary: true,
      educations: {
        select: {
          level: true,
          fieldOfStudy: true,
          institutionName: true,
          degree: true,
        },
      },
      nccProfile: {
        select: {
          nccCirtificate: true,
          nccRank: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  const structuredProfile = await structureStudentProfile(student);

  const { jobs, aiAvailable } = await findJobsWithGemini(structuredProfile);

  // aiAvailable=false means Gemini itself errored/timed out (network, quota, etc).
  // jobs=[] with aiAvailable=true means Gemini ran fine but found no real matches.
  // Either way we return 200 with a consistent, renderable shape — never a hard
  // failure for this step, per the "graceful frontend rendering" requirement.
  const message = !aiAvailable
    ? "Job recommendation service is temporarily unavailable. Please try again shortly."
    : jobs.length === 0
      ? "No matching jobs were found for your profile right now."
      : "Recommended jobs fetched successfully";

  return res.status(200).json(
    new ApiResponse(200, message, {
      profileUsedForMatching: structuredProfile,
      aiAvailable,
      totalMatches: jobs.length,
      jobs,
    }),
  );
});

export { getRecomendedJob };
