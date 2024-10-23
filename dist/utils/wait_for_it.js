"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = wait;
let timeout;
let i = 0;
async function wait(fn, time) {
    console.log(i, i++);
    if (timeout) {
        clearTimeout(timeout);
    }
    else {
        return new Promise((resolve, reject) => (timeout = setTimeout(async () => {
            const result = await fn;
            resolve(result);
        }, time)));
    }
}
