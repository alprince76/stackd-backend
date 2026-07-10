// Dev workaround for machines with SSL inspection (antivirus/proxy).
// Prisma engine downloads from binaries.prisma.sh fail TLS verification otherwise.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { execSync } = require("child_process");
const path = require("path");

execSync("npx prisma generate", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});
