import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property-based testing configuration', () => {
  it('runs property checks with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
      })
    );
  });
});
