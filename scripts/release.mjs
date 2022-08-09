import { readdir, readFile } from "fs/promises";
import { exec, execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";

async function gh(...args) {
  return (await promisify(execFile)('gh', args)).stdout;
}

async function listReleases() {
  const data = await gh('release', 'list');
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length);
  return lines.map(line => line.split('\t')[0]);
}

async function main() {
  const releaseTag =  await readFile('RELEASE', 'utf-8');
  const existing = await listReleases();

  if (existing.includes(releaseTag)) {
    return;
  }

  const releaseNotes = `release: ${releaseTag}`;

  await promisify(exec)('npm ci');
  await promisify(exec)('npm run codegen');
  await promisify(exec)('npm run build');
  await promisify(exec)('npm run package');

  const artifacts = (await readdir('release-artifacts'))
    .map(item => join('release-artifacts', item));

  await gh('release', 'create', releaseTag, ...artifacts, '--notes', releaseNotes);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
