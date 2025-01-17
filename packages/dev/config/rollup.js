/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import pluginAlias from '@rollup/plugin-alias';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginInject from '@rollup/plugin-inject';
import pluginJson from '@rollup/plugin-json';
import { nodeResolve as pluginResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import pluginCleanup from 'rollup-plugin-cleanup';

function sanitizePkg (pkg) {
  return pkg.replace('@alt-research/', '');
}

function createName (input) {
  return `alt-research-${sanitizePkg(input)}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

export function createInput (pkg, _index) {
  const partialPath = `packages/${sanitizePkg(pkg)}/build`;
  const index = (
    _index ||
    fs.existsSync(path.join(process.cwd(), partialPath, 'bundle.js'))
      ? 'bundle.js'
      : (
        JSON.parse(fs.readFileSync(path.join(process.cwd(), partialPath, 'package.json'), 'utf8')).browser ||
        'index.js'
      )
  );

  return `${partialPath}/${index}`;
}

export function createOutput (_pkg, external, globals) {
  const pkg = sanitizePkg(_pkg);

  return {
    file: `packages/${pkg}/build/bundle-alt-research-${pkg}.js`,
    format: 'umd',
    globals: external.reduce((all, pkg) => ({
      [pkg]: createName(pkg),
      ...all
    }), { ...globals }),
    intro: 'const global = window;',
    name: createName(_pkg),
    preferConst: true
  };
}

export function createBundle ({ entries = {}, external, globals = {}, index, inject = {}, pkg }) {
  return {
    external,
    input: createInput(pkg, index),
    output: createOutput(pkg, external, globals),
    plugins: [
      pluginAlias({ entries }),
      pluginJson(),
      pluginCommonjs(),
      pluginInject(inject),
      pluginResolve({ browser: true }),
      pluginCleanup()
    ]
  };
}
