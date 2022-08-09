import { readFile, writeFile } from "fs/promises";

async function main() {
  const { version } = JSON.parse(await readFile('package.json', 'utf-8'));
  const releaseTag = `v${version}`;

  await writeFile('RELEASE', releaseTag);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
