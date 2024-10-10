"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = wait;
async function wait(fn, time) {
    return new Promise((resolve, reject) => setTimeout(async () => {
        const result = await fn;
        resolve(result);
    }, time));
}
