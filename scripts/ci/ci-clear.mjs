import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

async function clear(dir) {
  try {
    const oldArtifacts = await readdir(dir);
    for (let file of oldArtifacts) {
      await unlink(join(dir, file));
    }
  } catch (error) {}
}

async function main() {
  await clear('release-artifacts');
  await clear('web-ext-artifacts');
  await clear(join('dist', 'chrome'));
  await clear(join('dist', 'firefox'));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
