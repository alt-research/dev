import * as pkg from '../package.json';

/**
 * This is the description with another line
 *
 * ```
 * const test = require('./test');
 *
 * test(); // => nothing
 * ```
 */
export function test (): void {
  console.log(pkg.version);
}
