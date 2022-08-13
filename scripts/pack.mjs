import JSZip from "jszip";
import { readdir, readFile, mkdir } from 'fs/promises';
import { join } from "path";
import { createWriteStream } from "fs";

const BROWSER = process.env.BROWSER ?? "chrome";
const DIST_FOLDER = join("dist", BROWSER);

async function main() {
  await mkdir('release-artifacts', { recursive: true });

  const files = await readdir(DIST_FOLDER);
  const archive = new JSZip();

  for (let file of files) {
    const contents = await readFile(join(DIST_FOLDER, file));
    archive.file(file, contents);
  }

  const resultName = BROWSER === "chrome" ? "batch-image-saver.zip" : "batch-image-saver-unsigned.xpi";
  const zipResult = createWriteStream(join('release-artifacts', resultName));
  const ended = new Promise((resolve, reject) => {
    zipResult.on('close', resolve);
    zipResult.on('error', reject);
  });

  archive.generateNodeStream({ type: "nodebuffer" }).pipe(zipResult);

  await ended;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
