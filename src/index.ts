import "dotenv/config";
import app from "./app.js";
import { validEnv } from "./validator/envValidator.js";

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

server.on("error", (err: any) => {
  console.error("Server failed to start:", err);
  if (validEnv.NODE_ENV === "DEV") console.error(err);
  process.exit(1);
});
