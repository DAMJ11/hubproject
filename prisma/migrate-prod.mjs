import { execSync } from "child_process";

const SCHEMA = "prisma/schema.prisma";
const RECOVERY_MIGRATION = "20260405035000_backfill_register_columns";

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

function runDeploy() {
  console.log("Running prisma migrate deploy...");
  run(`npx prisma migrate deploy --schema ${SCHEMA}`);
}

try {
  runDeploy();

  console.log("Prisma migrate status (after deploy)...");
  runNonBlocking(
    `npx prisma migrate status --schema ${SCHEMA}`,
    "Prisma migrate status failed"
  );
} catch (error) {
  console.error("Migration failed:", error.message);

  // One-time recovery for environments stuck with a failed migration record (P3009/P3018)
  // from an incompatible SQL variant.
  try {
    console.log(`Attempting recovery: mark ${RECOVERY_MIGRATION} as rolled back...`);
    run(`npx prisma migrate resolve --rolled-back ${RECOVERY_MIGRATION} --schema ${SCHEMA}`);
    console.log("Recovery applied. Retrying prisma migrate deploy...");
    runDeploy();

    console.log("Prisma migrate status (after recovery)...");
    runNonBlocking(
      `npx prisma migrate status --schema ${SCHEMA}`,
      "Prisma migrate status failed"
    );
  } catch (recoveryError) {
    console.error("Migration recovery failed:", recoveryError.message);
    process.exit(1);
  }
}
