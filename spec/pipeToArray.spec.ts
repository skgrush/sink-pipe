import { timer } from 'rxjs';
import { filter, map, switchMap, tap, throttleTime } from 'rxjs/operators';
import { pipeToArray } from '../src/pipeToArray';
import { SynchronousFailureError } from '../src/SynchronousFailureError';


describe('pipeToArray()', () => {

  it('should simply rebuild lone array', () => {
    const input = Object.freeze(['a', 'b', 'c'] as const);
    const expectedOutput = ['a', 'b', 'c'] as const;

    const actualOutput = pipeToArray(input);

    expect(actualOutput).toEqual(expectedOutput);
    expect(actualOutput).not.toBe(input);
  });

  it('should convert lone enumerable to entities', () => {
    const inputMap = new Map([ ['a', 1], ['b', 2] ] as const);

    const actualOutput = pipeToArray(inputMap);

    expect(actualOutput).toEqual([ ['a', 1], ['b', 2] ]);
  });

  it('should support single operator', () => {
    const input = Object.freeze([1, 2, 3] as const);
    const expectedOutput = [2, 4, 6];

    const actualOutput = pipeToArray(
      input,
      map(i => 2 * i),
    );

    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should support multiple operators', () => {
    const input = Object.freeze([1, 2, 3, 4] as const);
    const expectedOutput = ['2', '4'];

    const actualOutput = pipeToArray(
      input,
      filter(i => i % 2 === 0),
      map(i => String(i)),
    );

    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should fail on async operation', () => {
    const input = Object.freeze([1, 2, 3, 4] as const);

    const testBody = () => {
      const actualOutput = pipeToArray(
        input,
        switchMap(value => timer(1000)),
      );
      console.info('Unexpected actualOutput:', actualOutput);
    }

    expect(testBody).toThrowError(SynchronousFailureError);
  });
});
