import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import slimify, { defaults } from './src/index.ts';

describe('slimify', () => {
  it('uses compact defaults', () => {
    assert.deepStrictEqual(defaults, {
      removeEmptyArray: true,
      removeEmptyObject: true,
      removeEmptyString: false,
      removeNull: false,
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

    assert.deepStrictEqual(slimify(payload), {
      nullValue: null,
      emptyString: '',
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

    assert.deepStrictEqual(slimify(payload, options), payload);
  });

  it('removes opt-in cleanup targets', () => {
    const payload = { nullValue: null, empty: '', value: 'kept' };
    const options = { removeEmptyString: true, removeNull: true };

    assert.deepStrictEqual(slimify(payload, options), { value: 'kept' });
    assert.strictEqual(slimify('', options), undefined);
    assert.strictEqual(slimify(null, options), undefined);
  });

  it('handles root values according to the defaults', () => {
    assert.strictEqual(slimify([]), undefined);
    assert.strictEqual(slimify(null), null);
    assert.strictEqual(slimify(''), '');
  });

  it('preserves scalar values', () => {
    assert.strictEqual(slimify('value'), 'value');
    assert.strictEqual(slimify(42), 42);
    assert.strictEqual(slimify(true), true);
  });

  it('preserves non-plain objects', () => {
    const date = new Date('2026-08-17T00:00:00.000Z');
    const result = slimify({ date });

    assert.strictEqual(result.date, date);
  });

  it('cleans objects without a prototype', () => {
    const payload = Object.assign(Object.create(null), { empty: [], value: ['ok'] });

    assert.deepStrictEqual(slimify(payload), { value: 'ok' });
  });
});