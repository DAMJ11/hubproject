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
  console.error("Migration failed:", error.message);
  process.exit(1);
}
