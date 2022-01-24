#!/usr/bin/env node
import madge from 'madge';

console.log('$ alt-research-dev-circular', process.argv.slice(2).join(' '));

madge('./', { fileExtensions: ['ts', 'tsx'] })
  .then((res) => {
    const circular = res.circular();

    if (circular.length) {
      process.stdout.write(`Found ${circular.length} circular dependencies\n`);
    } else {
      process.stdout.write('No circular dependency found!\n');
    }

    circular.forEach((path, idx) => {
      process.stdout.write(`${(idx + 1).toString().padStart(4)}: `);

      path.forEach((module, idx) => {
        if (idx) {
          process.stdout.write(' > ');
        }

        process.stdout.write(module);
      });

      process.stdout.write('\n');
    });

    if (circular.length) {
      throw new Error('failed');
    }
  })
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
