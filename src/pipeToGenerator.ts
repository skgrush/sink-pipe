/**
 * Typings directly based on RxJS's `pipe()` implementation {https://github.com/ReactiveX/rxjs/blob/f9a60f/src/internal/Observable.ts#L392}
 * The explicit overloads are necessary because the operator chain types
 * directly relates each parameter positionally to its neighbors, which cannot
 * be simplified by variadic typings.
 */

import { from, Observable, OperatorFunction, Subject, UnaryFunction, zip } from "rxjs";
import { Pipeable } from "./Pipeable";
import { SynchronousFailureError } from "./SynchronousFailureError";


export function pipeToGenerator<T>(
  input: Pipeable<T>,
): Generator<T, void, unknown>;
export function pipeToGenerator<T, A>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
): Generator<A, void, unknown>;
export function pipeToGenerator<T, A, B>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
): Generator<B, void, unknown>;
export function pipeToGenerator<T, A, B, C>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
): Generator<C, void, unknown>;
export function pipeToGenerator<T, A, B, C, D>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
): Generator<D, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
): Generator<E, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E, F>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
): Generator<F, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E, F, G>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
): Generator<G, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E, F, G, H>(
  input: Pipeable<T>,
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
): Generator<H, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E, F, G, H, I>(
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
): Generator<I, void, unknown>;
export function pipeToGenerator<T, A, B, C, D, E, F, G, H, I>(
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
): Generator<unknown, void, unknown>;
/**
 * Pipeline the values of the input iterable to a generator,
 * lazily evaluating each entry.
 *
 * @param input - a pipeable value, i.e. a synchronous iterable.
 * @param operations - a spread chain of operations from RxJS operators.
 * @returns an generator of the values output by operation chain.
 */
export function* pipeToGenerator<T>(
  input: Pipeable<T>,
  ...operations: OperatorFunction<any, any>[]
): Generator<any, void, unknown> {
  // _very_ naïve first implementation…

  // first construct an observable from the input iterable
  const input$ = from(input);
  // second reduce the operator chain down to an observable based on the `input`
  const reducedObservable = operations
    .reduce(
      (prev: Observable<any>, fn: UnaryFunction<any, any>) => fn(prev),
      input$,
    );

  // third create subject to make the observable wait on each output
  const limiterSubject = new Subject<void>();

  // fourth set up the output variables, with a "nonOutput" so we can
  // catch missed outputs
  const NON_OUTPUT = {};
  let outputN: any = NON_OUTPUT;
  let tmp: any;

  // fifth combine the limiter and output to a subscription
  const subscription = zip(
    reducedObservable,
    limiterSubject,
  ).subscribe(([stepOutput, ]) => outputN = stepOutput);

  // sixth set the initial iteration
  limiterSubject.next();

  while (!subscription.closed) {
    // seventh+3N throw if the subscription didn't output while still open
    if (outputN === NON_OUTPUT) {
      subscription.unsubscribe();
      limiterSubject.complete();
      throw new SynchronousFailureError('Failed to synchronously resolve');
    }

    // eighth+3N copy the output and reset it before yielding
    tmp = outputN;
    outputN = NON_OUTPUT;
    yield tmp;

    // ninth+3N on the next yield, next() the limiter to see if a value's emited
    // this comes after the yield because generators... idk, like to do prep
    // the next op immediately. Also we next() at the beginning so we're setting
    // back to the same state the loop expects.
    limiterSubject.next();
  }

  // tenth+3N after the subscription closes, we know the operators are done.
  // If there is no output, there was never any output to begin with.
  // Else there is output, and we should yield it.
  if (outputN === NON_OUTPUT) {
    // the input/operator combo might've resulted in an empty output
    limiterSubject.complete();
    // throw new SynchronousFailureError('Non-output after sub closed?');
  } else {
    limiterSubject.complete();
    yield outputN;
  }
}
