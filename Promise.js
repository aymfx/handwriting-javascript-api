class Promise {
    /**
     * 构造器
     * @returns {Promise<object>}
     * @param executor<function>: executor有两个参数：resolve和reject
     */
    constructor(executor) {
        // 初始化状态
        this.state = 'pending';
        // 成功的值
        this.value = undefined;
        // 失败的原因
        this.reason = undefined;
        // 存储onFulfilled的数组
        this.onResolvedCallbacks = [];
        // 存储onRejected的数组
        this.onRejectedCallbacks = [];

        /**
         * resolve 成功函数
         * @param value<any>: 成功的值
         */
        const resolve = (value) => {
            // 只能在状态为pending的时候执行
            if (this.state === 'pending') {
                // resolve调用后，state转化为fulfilled
                this.state = 'fulfilled';
                // 存储value
                this.value = value;
                // 一旦resolve执行，调用onResolvedCallbacks数组的函数
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };

        /**
         * reject 失败函数
         * @param reason<any>: 失败的原因
         */
        const reject = (reason) => {
            // 只能在状态为pending的时候执行
            if (this.state === 'pending') {
                // resolve调用后，state转化为rejected
                this.state = 'rejected';
                // 存储reason
                this.reason = reason;
                // 一旦reject执行，调用onRejectedCallbacks数组的函数
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };

        // 如果executor执行报错，直接执行reject()
        try {
            // 执行 executor
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }

    /**
     * then 方法
     * @returns {Promise<object>}
     * @param onFulfilled<function>: 状态为fulfilled时调用
     * @param onRejected<function>: 状态为rejected时调用
     */
    then(onFulfilled, onRejected) {
        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        // onRejected如果不是函数，就忽略onRejected，直接抛出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => {
            throw err
        };

        // 返回一个新的Promise实例
        return new Promise((resolve, reject) => {
            // 状态为fulfilled的时候，执行onFulfilled，并传入this.value
            if (this.state === 'fulfilled') {
                // 异步调用
                setTimeout(() => {
                    try {
                        /**
                         * onFulfilled 方法
                         * @param value<function>: 成功的结果
                         */
                        const x = onFulfilled(this.value)
                        // 对返回值进行处理
                        resolvePromise(x, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                })
            }

            // 状态为rejected的时候，onRejected，并传入this.reason
            if (this.state === 'rejected') {
                // 异步调用
                setTimeout(() => {
                    try {
                        /**
                         * onRejected 方法
                         * @param reason<function>: 失败的原因
                         */
                        const x = onRejected(this.reason);

                        resolvePromise(x, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                })
            }

            // 状态为pending的时候，将onFulfilled、onRejected存入数组
            if (this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    // 异步调用
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value);
                            resolvePromise(x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
                this.onRejectedCallbacks.push(() => {
                    // 异步调用
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason);
                            resolvePromise(x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            }
        });
    }

    catch(callback) {
        return this.then(null, callback);
    }

    // finally(callback) {
    //     return this.then(res => {
    //         return Promise.resolve.resolve(callback()).then()
    //     })
    // }
}

/**
 * resolvePromise 方法
 * @param x<any>: 上一个then()的返回值
 * @param resolve<function>：Promise实例的resolve方法
 * @param reject<function>：Promise实例的reject方法
 */
function resolvePromise(x, resolve, reject) {
    // 防止多次调用
    let called;
    try {
        if (x instanceof Promise) {   // x 为Promise实例
            // 使用call执行then()，call的第一个参数是this，后续即then()的参数，即第二个是成功的回调方法，第三个为失败的回调函数
            x.then(
                res => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    // resolve 的结果依旧是promise实例，那就继续解析
                    resolvePromise(res, resolve, reject);
                },
                err => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    // 失败了就直接返回reject报错
                    reject(err);
                })
        } else {
            // x 为普通的对象或方法，直接返回
            resolve(x);
        }
    } catch (e) {
        if (called) return;
        called = true;
        reject(e);
    }
}

/**
 * Promise.all 方法
 * @returns {Promise<object>}
 * @param promises<iterable>: 一个promise的iterable类型输入
 */
Promise.all = function (promises) {
    let arr = [];

    return new Promise((resolve, reject) => {
        if (!promises.length) resolve([]);
        // 遍历promises
        for (const promise of promises) {
            promise.then(res => {
                arr.push(res);
                if (arr.length === promises.length) {
                    resolve(arr);
                }
            }, reject)
        }
    })
}

/**
 * Promise.allSettled 方法
 * @returns {Promise<object>}
 * @param promises<iterable>: 一个promise的iterable类型输入
 */
Promise.allSettled = function (promises) {
    let arr = [];

    return new Promise((resolve, reject) => {
        try {
            const processData = (data) => {
                arr.push(data);
                if (arr.length === promises.length) {
                    resolve(arr);
                }
            }

            if (!promises.length) resolve([]);
            // 遍历promises
            for (const promise of promises) {
                promise.then(res => {
                    processData({state: 'fulfilled', value: res})
                }, err => {
                    processData({state: 'rejected', reason: err})
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}


const p1 = new Promise((resolve, reject) => {
    resolve(1)
});
const p2 = new Promise((resolve, reject) => {
    reject(2)
});
const p3 = new Promise((resolve, reject) => {
    resolve(3)
})

const p = Promise.all([]).then(res => console.log(res), e => console.log(e));
