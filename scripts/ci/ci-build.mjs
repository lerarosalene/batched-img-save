import { exec } from "node:child_process";
import { promisify } from "node:util";

async function build(browser) {
  await promisify(exec)('npm run build', {
    env: { ...process.env, BROWSER: browser }
  });
}

async function pack(browser) {
  await promisify(exec)('npm run package', {
    env: { ...process.env, BROWSER: browser }
  });
}

async function main() {
  await build("chrome");
  await build("firefox");
  await pack("chrome");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

