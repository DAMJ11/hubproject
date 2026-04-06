import { execSync } from "child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  console.log("Prisma migrate status (before deploy)...");
  run("npx prisma migrate status --schema prisma/schema.prisma");

  console.log("Running prisma migrate deploy...");
  run("npx prisma migrate deploy --schema prisma/schema.prisma");

  console.log("Prisma migrate status (after deploy)...");
  run("npx prisma migrate status --schema prisma/schema.prisma");
} catch (error) {
  console.log("migrate deploy failed, attempting to resolve baseline...");
  try {
    run("npx prisma migrate resolve --applied 0_init --schema prisma/schema.prisma");
    console.log("Baseline resolved. Retrying migrate deploy...");
    run("npx prisma migrate deploy --schema prisma/schema.prisma");
    console.log("Prisma migrate status (after baseline + deploy)...");
    run("npx prisma migrate status --schema prisma/schema.prisma");
  } catch (resolveError) {
    console.error("Migration failed:", resolveError.message);
    process.exit(1);
  }
}
