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
            // 执行 executor
            executor(resolve,reject);
        }catch (e){
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