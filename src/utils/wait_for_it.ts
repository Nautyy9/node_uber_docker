export async function wait(fn: Promise<any> | void, time: number) {
  return new Promise((resolve, reject) =>
    setTimeout(async () => {
      const result = await fn
      resolve(result)
    }, time)
  )
}
