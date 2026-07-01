import { resend } from "../utils/resend-mail.js";
import { validEnv } from "../validator/envValidator.js";

const sendMail = async (to: string, mailBody: string, subject: string) => {
  try {
    const res = await resend.emails.send({
      from: validEnv.SYSTEM_DOMAIN,
      to: to,
      subject: subject,
      html: mailBody,
    });

    return true;
  } catch (error: any) {
    if (validEnv.NODE_ENV == "DEV") {
      console.log(error);
    }

    return false;
  }
};

export { sendMail };
