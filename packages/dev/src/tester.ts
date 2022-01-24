import { tester } from '.';

tester();

console.log('  (2)', typeof require === 'undefined' ? 'esm' : 'cjs');
