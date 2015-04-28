
'use strict';

function Promise(resolver){

    if(!(this instanceof Promise)) return new Promise(resolver);

    this.status = 'pending';

    this.value;

    this.reason;

    // 在同一个Promise里then方法 可调用多次
    this._resolves = [];
    this._rejects = [];

    if(isFn(resolver)) resolver(this.resolve.bind(this),this.reject.bind(this));

    return this;

}

Promise.prototype.then = function(resolve,reject){

    var next = this._next || (this._next = Promise());
    var status = this.status;
    var x;

    if('pending' === status){

        isFn(resolve) && this._resolves.push(resolve);

        isFn(reject)  && this._rejects.push(reject);

        return next;
    }

    if('resolved' === status){
        if(!isFn(resolve)){
            next.resolve(resolve);
        }else{
            try{
                x = resolve(this.value);
                resolveX(next,x);
            }catch(e){
                this.reject(e);
            }
        }
        return next;
    }

    if('rejected' === status){

        if(!isFn(reject)){
            next.reject(reject)
        }else{
            try{

                x = reject(this.reason);

                resolveX(next,x);

            }catch(e){
                this.reject(e);
            }
        }

        return next;
    }


};

Promise.prototype.resolve = function(value){

    if('rejected' === this.status) throw Error('Illegal call.');

    this.status = 'resolved';

    this.value = value;

    this._resolves.length && fireQ(this);

    return this;
};

Promise.prototype.reject = function(reason){

    if('resolved' === this.status) throw Error('Illegal call.');

    this.status = 'rejected';

    this.reason =reason;

    this._rejects.length && fireQ(this);

    return this;

}

Promise.prototype.catch = function(reject){
    return this.then(void 0 , reject);
};


Promise.cast = function(arg){

    var p = Promise();

    if(arg instanceof Promise)
    {
        return resolvePromise(p,arg);
    }else{
        return p.resolve(arg);
    }



};

Promise.resolve = function(arg){

    var p = Promise();

    if(isThenable(arg))
    {
        return resolveThen(p,arg);
    }
    else
        return p.resolve(arg);

};

/**
 * 当promises 执行完毕后，才返回 solved
 * @param promises
 * @returns {*}
 */
Promise.all = function(promises){

    var len = promises.length;
    var promise = Promise();

    var r = [];

    var pending = 0;

    var locked;

    console.log("promises : ",promises);

    each(promises,function(p,i){

        console.log(" p : %s",typeof p);

        p.then(function(v){
            r[i] = v;

            if(++pending == len && !locked) promise.resolve(r);

        },function(e){

            locked = true;

            promise.reject(e);

        });

    });

    return promise;
};


/**
 *
 *  当promises 有其中一个出现reject 时，就停止执行
 *
 * @param promises promise对象数组
 * @returns {*}
 */
Promise.any = function(promises){

    var promise = Promise();

    var called;

    each(promises,function(p,i){

        p.then(function(v){

            if(!called){
                promise.resolve(v);
                called = true;
            }

        },function(e){

            called = true;

            promise.reject(e);

        });


    });

    return promise;

};


/**
 * 出现拒绝时，返回 promise 对象
 * @param reason 拒绝的原因
 */
Promise.reject = function(reason){

    if(!(reason instanceof Error)) throw Error('reason must be an instance off Error');

    var p = Promise();

    p.reject(reason);

    return p;

};


/**
 * 执行
 * @param promise
 * @param x
 * @returns {*}
 */
function resolveX(promise,x){
    if( x === promise) promise.reject(new Error('TypeError'));

     if( x instanceof Promise){
         //判断是否 promise 实例
         return resolvePromise(promise,x);
     }
     else if(isThenable(x))
     {   //判断是否有then
         return resolveThen(promise,x);
     }
     else
         return promise.resolve(x);


}


/**
 * 执行promise
 * @param promise1
 * @param promise2
 */
function resolvePromise(promise1,promise2){

    var status = promise2.status;

    if('pending' === status){
        promise2.then(promise1.resolve.bind(promise1),promise1.reject.bind(promise1));
    }

    if('resolved' === status) promise1.resolve(promise2.value);
    if('rejected' === status) promise1.reject(promise2.reason);

}

/**
 * 执行 promise 的方法
 * @param promise
 * @param thanable
 * @returns {*}
 */
function resolveThen(promise,thanable){

    var called ;
    var resolve = once(function(x){
        if(called) return;
        resolveX(promise,x);
        called = true;
    });

    var reject = once(function(r){
        if(called) return;
        promise.reject(r);
        called = true;
    });

    try{
        thanable.then.call(thanable,resolve,reject);
    }catch(e){
        if(!called)
            throw e;
        else
            promise.reject(e)
    }

    return promise;
}


/**
 * 触发promise 的任务队列
 * @param promise
 * @returns {*}
 */
function fireQ(promise){
    var status = promise.status; //当前状态

    var queue = promise['resolved' === status ? '_resolves':'_rejects'];//根据当前状态取，从队列里取得方法

    var args = promise['resolved' === status ? 'value':'reason']; //取出传递的参数

    var fn,x;

    while(fn = queue.shift()){ //多队列里弹出元素并赋值给 fn

        x = fn.call(promise,args); //执行队列里的方法

        x && resolveX(promise._next,x); //执行下一具方法

    }

    return promise;

}


/**
 * ????
 */
function noop(){}

/**
 * 检测 fn 是否函数
 * @param fn
 * @returns {boolean}
 */
function isFn(fn){
    return 'function' === type(fn);
}

/**
 * 检测 o 是否对象
 * @param o
 * @returns {boolean}
 */
function isObj(o){
    return 'object' === type(o);
}


/**
 * 检测 obj 的类型
 * @param obj
 * @returns {string}
 */
function type(obj){

    var o = {};

    return o.toString.call(obj).replace(/\[object (\w+)\]/,'$1').toLowerCase();

}


/**
 * 判断 obj及 obj.then 仍可否执行
 * @param obj
 * @returns {*|Function}
 */
function isThenable(obj){
    return obj && obj.then && isFn(obj.then);
}


/**
 * once
 * @param fn
 * @returns {Function}
 */
function once(fn){

    var called,r;

    return function(){

        if(called) return r;

        called = true;

        return r = fn.apply(this,arguments);

    };

}

/**
 * 迭代数组
 * @param arr
 * @param iterator
 */
function each(arr,iterator){

    var i = 0;

    for(;arr[i];i++) iterator(arr[i],i,arr);

}

module.exports = Promise;