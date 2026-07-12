import { resend } from "../utils/resend-mail.js";
import { validEnv } from "../validator/envValidator.js";

import { transporter } from "../utils/nodeMaillerSetup.js";
const sendMail = async (to: string, mailBody: string, subject: string) => {
  try {
    const mailOptions = {
      from: `NCC IGIT <${validEnv.GMAIL}>`, // display name + address, not raw address
      to,
      subject, // use the actual param
      html: mailBody,
      text: mailBody.replace(/<[^>]+>/g, ""), // plain-text fallback — big deliverability win
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error("sendMail failed:", error?.message ?? error);
    return false;
  }
};

// upse if the production use resend

// const sendMail = async (to: string, mailBody: string, subject: string) => {
//   try {
//     const res = await resend.emails.send({
//       from: validEnv.SYSTEM_DOMAIN,
//       to: to,
//       subject: subject,
//       html: mailBody,
//     });

//     return true;
//   } catch (error: any) {
//     if (validEnv.NODE_ENV == "DEV") {
//       console.log(error);
//     }

//     return false;
//   }
// };

export { sendMail };
