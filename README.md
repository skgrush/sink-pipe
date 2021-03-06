# sink-pipe

> For *sync*hronous use of RxJS _pipe_ operators

## Credits

Function typing and operator reducer directly based on RxJS's
[pipe method](https://github.com/ReactiveX/rxjs/blob/f9a60f/src/internal/Observable.ts#L392)
and [pipeFromArray implementation](https://github.com/ReactiveX/rxjs/blob/f9a60f/src/internal/util/pipe.ts#L77)
respectively.

## Usage

#### Example using an array

```typescript
import { pipeToArray } from "sink-pipe/pipeToArray";
import { map, filter } from "rxjs/operators";

function titlecase(name: string): string {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function greetGuests(guestNames: readonly string[]): string[] {
  return pipeToArray(
    guestNames,
    filter((name) => name !== "sam"),
    map(titlecase),
    map((name) => `Hi ${name}!`)
  );
}

console.log(greetGuests(["dylan", "dan", "sam", "barry"]));
// -> ['Hi Dylan!', 'Hi Dan!', 'Hi Barry!']
```

#### Example using a generator

This exemplifies the benefits of lazy pipeline evaluation

```typescript
import { pipeToArray } from "sink-pipe/pipeToArray";
import { filter, take } from "rxjs/operators";

function* allNaturalNumbers() {
  let i = 1;
  while (true) {
    yield i++;
  }
}

const first5evens = pipeToArray(
  allNaturalNumbers(),
  filter((i) => i % 2 === 0),
  take(5)
);

console.log(first5evens);
// -> [2, 4, 6, 8, 10]
```

## Goals

- Experimenting with using RxJS operators synchronously with iterables.
- Maintaining a _minimal_ npm package.

## TODOs

- [ ] `pipeToGenerator` appears to be eagerly evaluating the whole pipe,
      rather than waiting on the generator consumer.
      [See pipeToGenerator.spec.ts](/spec/pipeToGenerator.spec.ts)
      "should not eagerly evaluate input > per-item".
