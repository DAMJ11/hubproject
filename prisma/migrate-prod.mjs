import { execSync } from "child_process";

try {
  console.log("Running prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (error) {
  console.log("migrate deploy failed, attempting to resolve baseline...");
  try {
    execSync("npx prisma migrate resolve --applied 0_init", { stdio: "inherit" });
    console.log("Baseline resolved. Retrying migrate deploy...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch (resolveError) {
    console.error("Migration failed:", resolveError.message);
    // Don't block app startup - the DB schema already exists
    console.log("Continuing with app startup...");
  }
}
