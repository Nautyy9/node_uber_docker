let timeout: NodeJS.Timeout
let i = 0
export async function wait(fn: Promise<any> | void, time: number) {
  if (timeout) {
    clearTimeout(timeout)
  } else {
    return new Promise(
      (resolve, reject) =>
        (timeout = setTimeout(async () => {
          const result = await fn
          resolve(result)
        }, time))
    )
  }
}
