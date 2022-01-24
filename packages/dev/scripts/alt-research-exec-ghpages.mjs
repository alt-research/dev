#!/usr/bin/env node

import { importRelative } from './import.cjs';

importRelative('gh-pages', 'gh-pages/bin/gh-pages.js')(process.argv)
  .then(() => {
    process.stdout.write('Published\n');
    process.exit(0);
  })
  .catch(() => process.exit(1));
