/**
 * Created by jianxinhu on 15/4/28.
 */

var Promise = require('promise/domains');
var queryDeeper = require('./QueryDeeper');
var m = require('mongoose');


function QueryHelper(modelName,mongoose){

    this._db = (mongoose === require('mongoose')) ? mongoose : m;

    this.model = m.model(modelName);

    this._conditions = [];

    this._query = this.model.find();

    this._sort = [];
}


QueryHelper.prototype = {
    "select":function(select){

        this._query = this._query.select(select);

        return this;
    },
    "exec" :function(fn){

        var conditions = {};

        var _ = this;

        if(this._conditions.length>0){
            conditions ={$or:this._conditions};
        }

        var q = this._query;
        //
        if(this._sort.length >0){
            q.sort(this._sort.join(' '));
        }


        q.exec(function(err,result){

            if(!err){

                var dq = new queryDeeper();

                dq.deepPopulate(_.model,result,fn);
            }

        });
    },
    "pagination":function(fn){
        var _ = this;
        var pageCount = _._pagecount  || 10;
        var pageIndex = _._pageIndex  || 1;
        var start = (pageIndex-1 || 0) * pageCount;
        var limit = pageCount;


        var conditions = {};

        if(_._conditions.length>0){
            conditions ={$or:this._conditions};
        }

        //var query = Promise.denodeify(function())

        var promise = new Promise(function (resolve, reject) {

            var q = _.model.find(conditions)
                .skip(start)
                .limit(limit);

            if(_._sort.length >0){
                q.sort(_._sort.join(' '));
            }

            q.exec(function(err,result){

                var dq = new queryDeeper();

                dq.deepPopulate(_.model,result,function(deepPopulateErr,deepPopulateResult){

                    resolve(deepPopulateResult);

                });


            });

        });

        promise.then(function(res){
            var data =res;

            _.model.find(conditions).count(function(err,total){

                var totalPage = (total % pageCount) === 0 ? parseInt(total/ pageCount) : parseInt(total/pageCount)+1;

                fn(null,data,total,totalPage, pageCount,pageIndex);
            });
        });

    }
}

QueryHelper.prototype.limit = function(start,limit){

    this._pageIndex = start<=0 ? 1 : start;

    this._pagecount = limit || 10;
    return  this;
};

QueryHelper.prototype.query = function(opt){

    var _this = this;

    if(typeof opt!=="undefined")
        this._conditions.push(opt);

    this._query = this.model.find();

    return this;
};


QueryHelper.prototype.queryOne = function(condition){

    this._query = this.model.findOne();

    if(typeof condition!=="undefined")
        this._conditions.push(condition);

    return this;
}

QueryHelper.prototype.sort = function(sortType){

    this._sort.push(sortType);

    return this;
}




/**
 * 模糊查找
 * @param text
 * @returns {RegExp}
 */
QueryHelper.like = function(text){

    var regexpStr = text.replace('%','\.*').replace('%','\.*');

    return new RegExp('^'+regexpStr, "i");
}



module.exports = QueryHelper;