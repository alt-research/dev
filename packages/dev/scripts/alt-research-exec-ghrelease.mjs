#!/usr/bin/env node

import { importRelative } from './import.cjs';

importRelative('gh-release', 'gh-release/bin/cli.js');
