export function once(fn, ctx) {
  var result
  return function () {
    if (fn) {
      result = fn.apply(this || ctx, arguments)
      fn = null
    }
    return result
  }
}
