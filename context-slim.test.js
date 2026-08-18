import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import contextSlim, { defaults } from './src/index.ts';

describe('contextSlim', () => {
  it('uses compact defaults', () => {
    assert.deepStrictEqual(defaults, {
      removeNull: true,
      removeUndefined: true,
      removeEmptyString: true,
      removeEmptyArray: true,
      removeEmptyObject: true,
      unwrapSingleArray: true,
    });
  });

  it('removes empty values recursively and unwraps single-item arrays', () => {
    const payload = {
      nullValue: null,
      undefinedValue: undefined,
      emptyString: '',
      emptyArray: [],
      emptyObject: {},
      primitive: ['ok'],
      object: [{ id: 1, unused: [] }],
      many: [1, 2],
      nested: [[], [{ active: true }]],
    };

    assert.deepStrictEqual(contextSlim(payload), {
      primitive: 'ok',
      object: { id: 1 },
      many: [1, 2],
      nested: { active: true },
    });
  });

  it('keeps disabled cleanup targets', () => {
    const payload = { nullValue: null, undefinedValue: undefined, empty: '', array: ['only'], emptyArray: [], object: {} };
    const options = {
      removeNull: false,
      removeUndefined: false,
      removeEmptyString: false,
      removeEmptyArray: false,
      removeEmptyObject: false,
      unwrapSingleArray: false,
    };

    assert.deepStrictEqual(contextSlim(payload, options), payload);
  });

  it('returns undefined when the root value is removed', () => {
    assert.strictEqual(contextSlim([]), undefined);
    assert.strictEqual(contextSlim(null), undefined);
  });

  it('preserves scalar values', () => {
    assert.strictEqual(contextSlim('value'), 'value');
    assert.strictEqual(contextSlim(42), 42);
    assert.strictEqual(contextSlim(true), true);
  });

  it('preserves non-plain objects', () => {
    const date = new Date('2026-08-17T00:00:00.000Z');
    const result = contextSlim({ date });

    assert.strictEqual(result.date, date);
  });

  it('cleans objects without a prototype', () => {
    const payload = Object.assign(Object.create(null), { empty: [], value: ['ok'] });

    assert.deepStrictEqual(contextSlim(payload), { value: 'ok' });
  });
});