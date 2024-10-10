export function resetOnce(fn, context) {
  let executed = false
  let res
  return function () {
    if (!executed) {
      executed = true
      res = fn.apply(context || this, arguments)
    }
    setTimeout(() => {
      executed = false
      return res
    }, 3000)
  }
}
