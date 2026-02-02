import { getContractData } from "../server/contract.js";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

const token = getArg("--token") || getArg("-t");
const debug = process.argv.includes("--debug");

async function main() {
  const data = await getContractData({
    tokenAddress: token,
    includeDebug: debug,
  });
  // Pretty print for easy copy/paste
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[treasury-check] error:", err);
  process.exit(1);
});

