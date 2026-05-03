import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty } from "./lib/seed.js";
import { connectMongo } from "@workspace/db";

const port = Number(process.env["PORT"] || "10000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function main() {
  try {
    await connectMongo();
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  }

  app.listen(port, async (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    await seedIfEmpty();
  });
}

main();
