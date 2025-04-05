import { execSync } from "child_process";

// Function to run a command and log its output
function runCommand(command: string) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: "utf8" });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error);
    return false;
  }
}

// Main function to run the migration and generate the client
async function main() {
  console.log("Starting Prisma update process...");

  // Generate a migration
  if (!runCommand("npx prisma migrate dev --name add_design_fields")) {
    console.error("Failed to generate migration");
    process.exit(1);
  }

  // Generate the Prisma client
  if (!runCommand("npx prisma generate")) {
    console.error("Failed to generate Prisma client");
    process.exit(1);
  }

  console.log("Prisma update completed successfully!");
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
