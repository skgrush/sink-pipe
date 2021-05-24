import { filter, take, tap } from 'rxjs/operators';
import { pipeToGenerator } from '../src/pipeToGenerator';


describe('pipeToGenerator()', () => {

  it('should simply generate for array with no operators', () => {
    const input = Object.freeze(['a', 'b', 'c'] as const);
    const expectedOutput = ['a', 'b', 'c'] as const;

    const actualOutput = pipeToGenerator(input);
    const actualOutputArray = [...actualOutput];

    expect(actualOutputArray).toEqual(expectedOutput);
  });

  describe('should handle valid non-output', () => {
    it('from empty input', () => {
      const input = Object.freeze([]);

      const actualOutput = pipeToGenerator(input);
      const actualOutputArray = [...actualOutput];

      expect(actualOutputArray).toEqual([]);
    });

    it('from restrictive operators', () => {
      const input = Object.freeze([1, 2, 3, 4]);

      const actualOutput = pipeToGenerator(
        input,
        filter((i) => i > 10),
      );
      const actualOutputArray = [...actualOutput];

      expect(actualOutputArray).toEqual([]);
    });
  });

  describe('should not eagerly evaluate input', () => {
    function* inputGenerator(i = 1) {
      while (true) {
        yield i;
        i *= 10;
      }
    }
    const expectedOutput = Object.freeze([1, 10, 100, 1000, 10000]);

    it('overall', () => {
      let numberOfOperatorCalls = 0;

      const actualOutput = pipeToGenerator(
        inputGenerator(),
        tap(() => numberOfOperatorCalls++),
        take(5),
      );
      const actualOutputArray = [...actualOutput];

      expect(actualOutputArray).toEqual(expectedOutput);
      expect(numberOfOperatorCalls).toBe(5);
    });

    it('per-item', () => {
      let numberOfOperatorCalls = 0;

      const actualOutput = pipeToGenerator(
        inputGenerator(),
        tap(() => numberOfOperatorCalls++),
        tap((i) => console.log('per-item', i)),
        take(5),
      );

      const first = actualOutput.next().value;
      const callsAfter1 = numberOfOperatorCalls;
      const second = actualOutput.next().value;
      const callsAfter2 = numberOfOperatorCalls;

      const rest = [...actualOutput];

      expect(first).toBe(1);
      expect(second).toBe(10);
      expect(callsAfter1).toBe(1);
      expect(callsAfter2).toBe(2);
      expect(rest).toEqual(expectedOutput.slice(2));
      expect(numberOfOperatorCalls).toBe(5);
    });
  });
});
