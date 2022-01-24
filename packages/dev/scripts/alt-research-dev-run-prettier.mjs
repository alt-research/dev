#!/usr/bin/env node
import { __dirname } from './dirname.mjs';
import execSync from './execSync.mjs';

console.log('$ alt-research-dev-run-prettier', process.argv.slice(2).join(' '));

execSync(`yarn alt-research-exec-prettier --write ${__dirname}`);
