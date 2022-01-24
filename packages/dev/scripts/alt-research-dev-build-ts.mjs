#!/usr/bin/env node

import babel from '@babel/cli/lib/babel/dir.js';
import fs from 'fs';
import path from 'path';

import { EXT_CJS, EXT_ESM } from '../config/babel-extensions.cjs';
import copySync from './copySync.mjs';
import { __dirname } from './dirname.mjs';
import execSync from './execSync.mjs';

const BL_CONFIGS = ['js', 'cjs'].map((e) => `babel.config.${e}`);
const WP_CONFIGS = ['js', 'cjs'].map((e) => `webpack.config.${e}`);
const RL_CONFIGS = ['js', 'mjs', 'cjs'].map((e) => `rollup.config.${e}`);
const CPX = ['patch', 'js', 'cjs', 'mjs', 'json', 'd.ts', 'css', 'gif', 'hbs', 'jpg', 'png', 'svg']
  .map((e) => `src/**/*.${e}`)
  .concat(['package.json', 'README.md', 'LICENSE']);

console.log('$ alt-research-dev-build-ts', process.argv.slice(2).join(' '));

const isTypeModule = EXT_ESM === '.js';
const EXT_OTHER = isTypeModule ? EXT_CJS : EXT_ESM;

// webpack build
function buildWebpack() {
  const config = WP_CONFIGS.find((c) => fs.existsSync(path.join(process.cwd(), c)));

  execSync(`yarn alt-research-exec-webpack --config ${config} --mode production`);
}

// compile via babel, either via supplied config or default
async function buildBabel(dir, type) {
  const configs = BL_CONFIGS.map((c) => path.join(process.cwd(), `../../${c}`));
  const outDir = path.join(process.cwd(), 'build');

  await babel.default({
    babelOptions: {
      configFile:
        type === 'esm'
          ? path.join(__dirname, '../config/babel-config-esm.cjs')
          : configs.find((f) => fs.existsSync(f)) ||
            path.join(__dirname, '../config/babel-config-cjs.cjs')
    },
    cliOptions: {
      extensions: ['.ts', '.tsx'],
      filenames: ['src'],
      ignore: '**/*.d.ts',
      outDir,
      outFileExtension: type === 'esm' ? EXT_ESM : EXT_CJS
    }
  });

  // rewrite a skeleton package.json with a type=module
  if (type !== 'esm') {
    [
      ...CPX,
      `../../build/${dir}/src/**/*.d.ts`,
      `../../build/packages/${dir}/src/**/*.d.ts`
    ].forEach((s) => copySync(s, 'build'));
  }
}

function relativePath(value) {
  return `${value.startsWith('.') ? value : './'}${value}`.replace(/\/\//g, '/');
}

// creates an entry for the cjs/esm name
function createMapEntry(rootDir, jsPath, noTypes) {
  jsPath = relativePath(jsPath);

  const otherPath = jsPath.replace('.js', EXT_OTHER);
  const hasOther = fs.existsSync(path.join(rootDir, otherPath));
  const typesPath = jsPath.replace('.js', '.d.ts');
  const hasTypes =
    !noTypes && jsPath.endsWith('.js') && fs.existsSync(path.join(rootDir, typesPath));
  const otherReq = isTypeModule ? 'require' : 'import';
  const field =
    otherPath !== jsPath && hasOther
      ? {
          ...(hasTypes ? { types: typesPath } : {}),
          [otherReq]: otherPath,
          // eslint-disable-next-line sort-keys
          default: jsPath
        }
      : hasTypes
      ? {
          types: typesPath,
          // eslint-disable-next-line sort-keys
          default: jsPath
        }
      : jsPath;

  if (jsPath.endsWith('.js')) {
    if (jsPath.endsWith('/index.js')) {
      return [jsPath.replace('/index.js', ''), field];
    } else {
      return [jsPath.replace('.js', ''), field];
    }
  }

  return [jsPath, field];
}

// find the names of all the files in a certain directory
function findFiles(buildDir, extra = '', exclude = []) {
  const currDir = extra ? path.join(buildDir, extra) : buildDir;

  return fs.readdirSync(currDir).reduce((all, jsName) => {
    const jsPath = `${extra}/${jsName}`;
    const thisPath = path.join(buildDir, jsPath);
    const toDelete =
      jsName.includes('.spec.') || // no tests
      jsName.includes('.manual.') || // no manual checks
      jsName.endsWith('.d.js') || // no .d.ts compiled outputs
      jsName.endsWith(`.d${EXT_OTHER}`) || // same as above, esm version
      (jsName.endsWith('.d.ts') && // .d.ts without .js as an output
        !fs.existsSync(path.join(buildDir, jsPath.replace('.d.ts', '.js')))) ||
      thisPath.includes('/test/');

    if (fs.statSync(thisPath).isDirectory()) {
      findFiles(buildDir, jsPath).forEach((entry) => all.push(entry));
    } else if (toDelete) {
      fs.unlinkSync(thisPath);
    } else if (
      !jsName.endsWith(EXT_OTHER) ||
      !fs.existsSync(path.join(buildDir, jsPath.replace(EXT_OTHER, '.js')))
    ) {
      if (!exclude.some((e) => jsName === e)) {
        // this is not mapped to a compiled .js file (where we have dual esm/cjs mappings)
        all.push(createMapEntry(buildDir, jsPath));
      }
    }

    return all;
  }, []);
}

// iterate through all the files that have been built, creating an exports map
function buildExports() {
  const buildDir = path.join(process.cwd(), 'build');
  const pkgPath = path.join(buildDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const list = findFiles(buildDir, '', ['README.md', 'LICENSE']);

  if (!list.some(([key]) => key === '.')) {
    const indexDef = relativePath(pkg.main).replace('.js', '.d.ts');

    // for the env-specifics, add a root key (if not available)
    list.push([
      '.',
      {
        types: indexDef,
        // eslint-disable-next-line sort-keys
        browser: createMapEntry(buildDir, pkg.browser, true)[1],
        node: createMapEntry(buildDir, pkg.main, true)[1],
        'react-native': createMapEntry(buildDir, pkg['react-native'], true)[1]
      }
    ]);
  }

  pkg.exports = list
    .filter(
      ([path, config]) =>
        typeof config === 'object' ||
        !list.some(([, c]) => typeof c === 'object' && Object.values(c).some((v) => v === path))
    )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (all, [path, config]) => ({
        ...all,
        [path]:
          typeof config === 'string'
            ? config
            : {
                ...((pkg.exports && pkg.exports[path]) || {}),
                ...config
              }
      }),
      {}
    );
  pkg.type = isTypeModule ? 'module' : 'commonjs';

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function timeIt(label, fn) {
  const start = Date.now();

  fn();

  console.log(`${label} (${Date.now() - start}ms)`);
}

async function buildJs(dir) {
  const json = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));
  const { name, version } = json;

  console.log(`*** ${name} ${version}`);

  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack();
    } else {
      await buildBabel(dir, 'cjs');
      await buildBabel(dir, 'esm');

      timeIt('Successfully built exports', () => buildExports());
    }
  }

  console.log();
}

async function main() {
  execSync('yarn alt-research-dev-clean-build');

  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));

  if (pkg.scripts && pkg.scripts['build:extra']) {
    execSync('yarn build:extra');
  }

  execSync('yarn alt-research-exec-tsc --emitDeclarationOnly --outdir build');

  process.chdir('packages');

  const dirs = fs
    .readdirSync('.')
    .filter(
      (dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src'))
    );
  const locals = [];

  // get all package names
  for (const dir of dirs) {
    const { name } = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), dir, './package.json'), 'utf-8')
    );

    locals.push([dir, name]);
  }

  // build packages
  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(dir, locals);

    process.chdir('..');
  }

  process.chdir('..');

  if (RL_CONFIGS.some((c) => fs.existsSync(path.join(process.cwd(), c)))) {
    execSync('yarn alt-research-exec-rollup --config');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
