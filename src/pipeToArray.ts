/**
 * Typings directly based on RxJS's `pipe()` implementation {https://github.com/ReactiveX/rxjs/blob/f9a60f/src/internal/Observable.ts#L392}
 * The explicit overloads are necessary because the operator chain types
 * directly relates each parameter positionally to its neighbors, which cannot
 * be simplified by variadic typings.
 */

import type { Observable, OperatorFunction, UnaryFunction } from 'rxjs';
import { from } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { Pipeable } from './Pipeable';
import { SynchronousFailureError } from './SynchronousFailureError';

export function pipeToArray<T>(
  input: Pipeable<T>,
): Array<T>;
export function pipeToArray<T, A>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
): Array<A>;
export function pipeToArray<T, A, B>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
): Array<B>;
export function pipeToArray<T, A, B, C>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
): Array<C>;
export function pipeToArray<T, A, B, C, D>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
): Array<D>;
export function pipeToArray<T, A, B, C, D, E>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
): Array<E>;
export function pipeToArray<T, A, B, C, D, E, F>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
): Array<F>;
export function pipeToArray<T, A, B, C, D, E, F, G>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
): Array<G>;
export function pipeToArray<T, A, B, C, D, E, F, G, H>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
): Array<H>;
export function pipeToArray<T, A, B, C, D, E, F, G, H, I>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
): Array<I>;
export function pipeToArray<T, A, B, C, D, E, F, G, H, I>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
  ...opsN: OperatorFunction<any, any>[]
): Array<unknown>;
/**
 * Pipeline the values of the input iterable
 * @param input - a pipeable value, i.e. a synchronous iterable.
 * @param operations - a spread chain of operations from RxJS operators.
 * @returns an array of the values synchronously output by operation chain.
 */
export function pipeToArray<T>(
  input: Pipeable<T>,
  ...operations: OperatorFunction<any, any>[]
): Array<any> {
  let outputs: Array<any> | undefined;

  // first construct an observable from the input iterable
  const input$ = from(input);
  // second reduce the operator chain down to an observable based on the `input`
  const reducedObservable = operations
    .reduce(
      (prev: Observable<any>, fn: UnaryFunction<any, any>) => fn(prev),
      input$,
    );

  // third pipe the entire output sequence to an array and resolve the output
  const subscription = reducedObservable
    .pipe(toArray())
    .subscribe((subOutputs) => outputs = subOutputs);

  // fourth check that the values were resolved synchronously
  if (!outputs) {
    subscription.unsubscribe();
    throw new SynchronousFailureError('Failed to synchronously resolve');
  }

  // if we've made it this far, the outputs are resolved and `from` closed
  // itself, so we can return the resolved outputs.
  return outputs;
}
