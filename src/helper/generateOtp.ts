import { randomInt } from "crypto";

function generateOTP() {
  return randomInt(1000, 10000).toString();
}

export { generateOTP };
