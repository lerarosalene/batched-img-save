import { readdir } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";

async function gh(...args) {
  return (await promisify(execFile)('gh', args)).stdout;
}

function chop(str, start) {
  if (!str.startsWith(start)) {
    throw new Error(`Expected string starting with "${start}"`);
  }

  return str.slice(start.length);
}

async function main() {
  const releaseTag = chop(process.env.GITHUB_REF, "refs/tags/");
  const releaseNotes = `release: ${releaseTag}`;

  const artifacts = (await readdir('release-artifacts'))
    .map(item => join('release-artifacts', item));

  await gh('release', 'create', releaseTag, ...artifacts, '--notes', releaseNotes, '-t', releaseTag);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
