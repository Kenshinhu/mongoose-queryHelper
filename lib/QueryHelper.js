/**
 * Created by jianxinhu on 15/4/28.
 */

var Promise = require('./promise');

var m = require('mongoose');

function QueryHelper(modelName,mongoose){

    console.log(mongoose === require('mongoose'));

    this._db = (mongoose === require('mongoose')) ? mongoose : m;

    this.model = m.model(modelName);

    this._conditions = [];

    this._sort = [];
}


QueryHelper.prototype = {
    "select":function(select){
        return this.q.select(select);
    },
    "exec" :function(fn){

        var conditions = {};

        if(this._conditions.length>0){
            conditions ={$or:this._conditions};
        }

        console.log(this._conditions);

        var q = this.model.find(conditions);

        //if(this._sort.length >0){
        //    console.log("sort "+this._sort);
        //    q.sort(this.sort.toString().join(' '));
        //}


        q.exec(fn);
    },
    "pagination":function(fn){
        var _ = this;
        var start = (_._pageIndex-1 || 0) * _._pagecount;
        var limit = _._pagecount;

        var conditions = {};

        if(_._conditions.length>0){
            conditions ={$or:this._conditions};
        }

        Promise(function(resolve,reject){



            var q = _.model.find(conditions)
                   .skip(start)
                   .limit(limit);

            if(_._sort.length >0){
                console.log("_._sort.join(' ') : "+_._sort.join(' '));
                q.sort(_._sort.join(' '));
            }

            q.exec(function(err,result){

                console.log(err);

                resolve(result);
            });

        }).then(function(resolve){

            var data =resolve;

            _.model.find(conditions).count(function(err,total){

                var totalPage = (total % _._pagecount) === 0 ? parseInt(total/ _._pagecount) : parseInt(total/ _._pagecount)+1;

                fn(null,data,total,totalPage, _._pageIndex);
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

    return this;
};

QueryHelper.prototype.sort = function(sortType){

    this._sort.push(sortType);

    return this;
}

QueryHelper.like = function(text){

    var regexpStr = text.replace('%','\.*').replace('%','\.*');

    return new RegExp('^'+regexpStr, "i");
}



module.exports = QueryHelper;