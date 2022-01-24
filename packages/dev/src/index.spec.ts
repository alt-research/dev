import { adder, blah } from './test1';
import { echo } from '.';

describe('index', () => {
  it('runs the echo function', () => {
    blah();

    expect(
      echo('something')
    ).toEqual('1: 123: something');
  });

  it('runs the adder function', () => {
    expect(adder(1, 2)).toBe(3);
  });
});
