import JSZip from "jszip";
import { readdir, readFile } from 'fs/promises';
import { join } from "path";
import { createWriteStream } from "fs";

async function main() {
  const files = await readdir('dist');
  const archive = new JSZip();

  for (let file of files) {
    const contents = await readFile(join('dist', file));
    archive.file(file, contents);
  }

  const zipResult = createWriteStream('batched-img-save.zip');
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
