export const helpers = {
  ifEquals: (a, b, options) => {
    if (options && options.fn) return a == b ? options.fn(this) : options.inverse(this);
    return a == b;
  },
  gt: (a, b, options) => {
    if (options && options.fn) return a > b ? options.fn(this) : options.inverse(this);
    return a > b;
  },
  lt: (a, b, options) => {
    if (options && options.fn) return a < b ? options.fn(this) : options.inverse(this);
    return a < b;
  },
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,

  // range trả về mảng để dùng với #each
  range: (start, end) => {
    const result = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }
};