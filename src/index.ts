export interface CleanOptions {
  removeNull?: boolean;
  removeUndefined?: boolean;
  removeEmptyString?: boolean;
  removeEmptyArray?: boolean;
  removeEmptyObject?: boolean;
  unwrapSingleArray?: boolean;
}

const SKIP = Symbol('skip');

export const defaults: Readonly<Required<CleanOptions>> = {
  removeEmptyArray: true,
  removeEmptyObject: true,
  removeEmptyString: false,
  removeNull: false,
  removeUndefined: true,
  unwrapSingleArray: true,
};

function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function clean(value: unknown, options: Required<CleanOptions>): unknown {
  if (value === null) return options.removeNull ? SKIP : value;
  if (value === undefined) return options.removeUndefined ? SKIP : value;
  if (value === '' && options.removeEmptyString) return SKIP;

  if (Array.isArray(value)) {
    const items = value.map(item => clean(item, options)).filter(item => item !== SKIP);
    if (items.length === 0 && options.removeEmptyArray) return SKIP;
    return items.length === 1 && options.unwrapSingleArray ? items[0] : items;
  }

  if (typeof value === 'object') {
    if (!isPlainObject(value)) return value;

    const entries = Object.entries(value)
      .map(([key, item]) => [key, clean(item, options)] as const)
      .filter(([, item]) => item !== SKIP);

    if (entries.length === 0 && options.removeEmptyObject) return SKIP;
    return Object.fromEntries(entries);
  }

  return value;
}

export default function pruneData(value: unknown, options: CleanOptions = {}): unknown {
  const result = clean(value, { ...defaults, ...options });
  return result === SKIP ? undefined : result;
}