# context-slim

A tiny, dependency-free Node.js utility that removes low-value response data before encoding it for an agent (for example, with TOON).

## Why

Agent context windows are finite. Large, deeply nested payloads often spend tokens on empty fields and structural detail that does not help an agent answer a question. This utility reduces that noise before encoding to TOON: it can remove empty values and turn one-item arrays into their only value.

For agent-facing data, the value is often more useful than preserving whether it arrived as `{ item }` or `[{ item }]`. The transformation is recursive and does not mutate the input.

Do not use it for API payloads, persistence, events, RPC, or communication between objects/services. It deliberately changes shape and may remove meaningful distinctions such as `null`, `[]`, `{}`, and a single-item array. Use it only at the final boundary before presenting data to an agent.

## Install

```bash
npm install context-slim
```

Requires Node.js 26 or newer.

## Usage

```js
import contextSlim from 'context-slim';

const payload = contextSlim({
  status: ['ok'],
  metadata: null,
  rows: [{ id: 1, tags: [] }],
});

// { status: 'ok', rows: { id: 1 } }
```

Run it before your encoder:

```js
const toon = encode(contextSlim(response));
```

## TOON Example

Given this response:

```js
const response = [
  {
    id: 1,
    student: {},
    works: [],
    answers: [{ score: 10, comment: 'Great answer!' }],
    question: 'What is the capital of France?',
  },
  {
    id: 2,
    student: { name: 'john' },
    works: [''],
    answers: [{ score: 8, comment: 'Good answer, but could be more detailed.' }],
    question: 'What is the largest ocean on Earth?',
  },
  {
    id: 3,
    student: {},
    works: [null],
    answers: [{ score: 9, comment: 'Well explained!' }],
    question: 'What is the process of photosynthesis?',
  },
];
```

Encoding the original response with TOON retains the empty values and nested one-item arrays:

```text
[3]:
    - id: 1
        student:
        works: []
        answers[1]{score,comment}:
            10,Great answer!
        question: What is the capital of France?
    - id: 2
        student:
            name: john
        works[1]: ""
        answers[1]{score,comment}:
            8,"Good answer, but could be more detailed."
        question: What is the largest ocean on Earth?
    - id: 3
        student:
        works[1]: null
        answers[1]{score,comment}:
            9,Well explained!
        question: What is the process of photosynthesis?
```

After `contextSlim(response)`, empty values are removed and one-item arrays are unwrapped. Encoding the result with TOON produces:

```text
[3]{id,answers{score,comment},question}:
    1,10,Great answer!,What is the capital of France?
    2,8,"Good answer, but could be more detailed.",What is the largest ocean on Earth?
    3,9,Well explained!,What is the process of photosynthesis?
```

## Options

All options default to `true`.

| Option | Effect |
| --- | --- |
| `removeNull` | Removes `null` values. |
| `removeUndefined` | Removes `undefined` values. |
| `removeEmptyString` | Removes `''` values. |
| `removeEmptyArray` | Removes empty arrays. |
| `removeEmptyObject` | Removes empty plain objects. |
| `unwrapSingleArray` | Changes `[value]` into `value`. |

```js
contextSlim(payload, {
  removeNull: false,
  unwrapSingleArray: false,
});
```

Objects are traversed only when they are plain objects. Instances such as `Date`, `Map`, and custom classes are preserved.

## Development

```bash
npm install
npm run build
npm test
npm run coverage
```

The published package has no runtime dependencies. TypeScript is a development-only compiler that generates `dist/index.js` and `dist/index.d.ts`; tests run against the compiled JavaScript. Tests use the built-in `node:test` runner with process isolation and built-in coverage.

## License

MIT
