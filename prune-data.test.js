import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import pruneData, { defaults } from './src/index.ts';

describe('pruneData', () => {
  it('uses compact defaults', () => {
    assert.deepStrictEqual(defaults, {
      removeEmptyArray: true,
      removeEmptyObject: true,
      removeEmptyString: true,
      removeNull: true,
      removeUndefined: true,
      unwrapSingleArray: true,
    });
  });

  it('cleans values recursively and unwraps single-item arrays', () => {
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

    assert.deepStrictEqual(pruneData(payload), {
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

    assert.deepStrictEqual(pruneData(payload, options), payload);
  });

  it('removes explicitly enabled cleanup targets', () => {
    const payload = { nullValue: null, empty: '', value: 'kept' };
    const options = { removeEmptyString: true, removeNull: true };

    assert.deepStrictEqual(pruneData(payload, options), { value: 'kept' });
    assert.strictEqual(pruneData('', options), undefined);
    assert.strictEqual(pruneData(null, options), undefined);
  });

  it('handles root values according to the defaults', () => {
    assert.strictEqual(pruneData([]), undefined);
    assert.strictEqual(pruneData(null), undefined);
    assert.strictEqual(pruneData(''), undefined);
  });

  it('preserves scalar values', () => {
    assert.strictEqual(pruneData('value'), 'value');
    assert.strictEqual(pruneData(42), 42);
    assert.strictEqual(pruneData(true), true);
  });

  it('preserves non-plain objects', () => {
    const date = new Date('2026-08-17T00:00:00.000Z');
    const result = pruneData({ date });

    assert.strictEqual(result.date, date);
  });

  it('cleans objects without a prototype', () => {
    const payload = Object.assign(Object.create(null), { empty: [], value: ['ok'] });

    assert.deepStrictEqual(pruneData(payload), { value: 'ok' });
  });
});