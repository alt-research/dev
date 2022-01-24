#!/usr/bin/env node

import execSync from './execSync.mjs';

const args = process.argv.slice(2).join(' ');

execSync(`yarn webpack ${args}`);
