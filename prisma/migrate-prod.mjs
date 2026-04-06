import { execSync } from "child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function runNonBlocking(command, label) {
  try {
    run(command);
  } catch (error) {
    console.warn(`${label} (non-blocking):`, error.message);
  }
}

try {
  console.log("Running prisma migrate deploy...");
  run("npx prisma migrate deploy --schema prisma/schema.prisma");

  console.log("Prisma migrate status (after deploy)...");
  runNonBlocking(
    "npx prisma migrate status --schema prisma/schema.prisma",
    "Prisma migrate status failed"
  );
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
}
