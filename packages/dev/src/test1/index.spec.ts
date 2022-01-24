import index, { blah } from '.';

describe('index', () => {
  it('runs the test', () => {
    expect(blah).toBeDefined();
  });

  it('runs the echo function', () => {
    expect(
      index('something')
    ).toEqual('something');
  });
});
