import pbjs from 'protobufjs-cli/pbjs.js';
import pbts from 'protobufjs-cli/pbts.js';

import { join } from "path";
import { promisify } from 'util';
import { mkdir } from 'fs/promises';

async function main() {
  await mkdir(join('src', '__generated'), { recursive: true });
  const pbjsArgs = [
    join('src', 'proto', 'message.proto'),
    '-t',
    'static-module',
    '-o',
    join('src', '__generated', 'message.js'),
  ];

  await promisify(pbjs.main)(pbjsArgs);

  const pbtsArgs = [
    join('src', '__generated', 'message.js'),
    '-o',
    join('src', '__generated', 'message.d.ts'),
  ];

  await promisify(pbts.main)(pbtsArgs);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
