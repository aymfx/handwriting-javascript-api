# 实现 Promise
## Promise的声明
当我们使用`Promise`的时候，通常都是`new Promise((resolve, reject) => {})`。

因此我们可以看出：

- `Promise`是一个类；
- `Promise`类的构造函数的第一个参数是函数，这个函数叫处理器函数（`executor function`）；
- 而在处理器函数中，有了两个参数：`resolve`和`reject`
    - 当异步任务顺利完成且返回结果值的时候，我们会调用`resolve`函数；
    - 当异步任务失败且返回失败原因（通常是一个错误对象）时，会调用`reject`函数。

因此，我们可以初步声明一下`Promise`类。

```javascript
class Promise {
    /**
     * 构造器
     * @returns {Promise<object>}
     * @param executor<function>: executor有两个参数：resolve和reject
     */
    constructor(executor) {
        // resolve 成功
        const resolve = () => {};

        // reject 失败
        const reject = () => {};

        // 执行 executor
        executor(resolve,reject);
    }
}
```

## 实现Promise的基本状态
`Promise`存在着三种状态：`pending`（等待态）、`fulfilled`（成功态）和`rejected`（失败态）：
- `Promise`的初始状态是`pending`状态；
- `pending`状态可以转换为`fulfilled`状态和`rejected`状态；
- `fulfilled`状态不可以转为其他状态，且必须有一个不可改变的值（value）；
- `rejected`状态不可以转为其他状态，且必须有一个不可改变的原因（reason）；
- 当在处理器函数中调用`resolve`函数并传入参数value，则状态改变为`fulfilled`，且不可以改变；
- 当在处理器函数中调用`reject`函数并传入参数reason，则状态改变为`rejected`，且不可以改变；
- 若处理器函数执行中报错，直接执行`reject`函数。

因此，我们需要在`Promise`类中设置三个变量：`state`（状态变量），`value`（成功值的变量）和`reason`（失败原因的变量），然后在`resolve`函数、`reject`函数以及执行`executor`函数报错的时候改变`state`的值。

```javascript
class Promise {
    constructor(executor) {
        // 初始化状态
        this.state = 'pending';
        // 成功的值
        this.value = undefined;
        // 失败的原因
        this.reason = undefined;
        
        /**
         * resolve 成功函数
         * @param value<any>: 成功的值
         */
        const resolve = (value) => {
            // 只能在状态为pending的时候执行
            if(this.state === 'pending'){
                // resolve调用后，state转化为fulfilled
                this.state = 'fulfilled';
                // 存储value
                this.value = value;
            }
        };

        /**
         * reject 失败函数
         * @param reason<any>: 失败的原因
         */
        const reject = (reason) => {
            // 只能在状态为pending的时候执行
            if(this.state === 'pending'){
                // resolve调用后，state转化为rejected
                this.state = 'rejected';
                // 存储reason
                this.reason = reason;
            }
        };

        // 如果executor执行报错，直接执行reject()
        try {
            executor(resolve,reject);
        }catch (e){
            reject(e);
        }
    }
}
```

## then方法
`Promise`有一个`then`方法，而该方法中有两个参数：`onFulfilled`和`onRejected`：
- 这两个参数都是一个函数，且会返回一个结果值；
- 当状态为`fulfilled`，只执行`onFulfilled`，传入`this.value`；
- 当状态为`rejected`，只执行`onRejected`，传入`this.reason`；

因此我们可以来实现一下`then`方法。

```javascript
class Promise {
   constructor(executor) {...}

    /**
     * then 方法
     * @returns {Promise<object>}
     * @param onFulfilled<function>: 状态为fulfilled时调用
     * @param onRejected<function>: 状态为rejected时调用
     */
    then(onFulfilled, onRejected) {
        // 状态为fulfilled的时候，执行onFulfilled，并传入this.value
        if(this.state === 'fulfilled'){
            /**
             * onFulfilled 方法
             * @param value<function>: 成功的结果
             */
            onFulfilled(this.value)
        }

        // 状态为rejected的时候，onRejected，并传入this.reason
        if(this.state === 'rejected'){
            /**
             * onRejected 方法
             * @param reason<function>: 失败的原因
             */
            onRejected(this.reason)
        }
    }
}
```