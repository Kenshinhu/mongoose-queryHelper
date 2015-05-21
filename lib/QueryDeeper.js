/**
 * Created by jianxinhu on 15/5/20.
 */
function deepQuery(option){
    this._schemaPathLevel = 1; //SchemaPath 层次
    this._db;                  //db 实例
    this._query;               //query 对象
    this._maxDeepLevel = 5;     //最大嵌套层次
}

/**
 * 整合路径
 * @param model
 * @param level
 * @returns {Array}
 */
deepQuery.prototype.modelPopulate = function(model,level){

    this._db = model.db;

    this._query = model.find();

    var schema = model.schema;

    var paths = schema.paths;

    var levelPaths = [];

    for(var key in paths){

        var path = paths[key];

        if(path.caster && path.caster.options){
            path = path.caster;
        }

        if(path.options && path.options.ref){

            var subDocs = model.db.model(path.options.ref);

            levelPaths.push({
                "path":path.path,
                "ref":path.options.ref
            });

            if(level<this._maxDeepLevel){
                //最大次层
                var subPaths = this.modelPopulate(subDocs,level+1);

                for(var keys in subPaths){

                    var subPath = subPaths[keys];

                    levelPaths.push({
                        "path":path.path+"."+subPath.path,
                        "ref":subPath.ref
                    });

                }
            }
        }
    }

    if(levelPaths.length>0)
        this._schemaPathLevel++;


    return levelPaths;
}

deepQuery.prototype.deepPopulate = function(model,document,fn){
    var paths = this.modelPopulate(model,0);

    this.execPopulate(document,0,paths,fn);
}


deepQuery.prototype.execPopulate = function(document,level,paths,fn){

    var _ = this;

    if(paths.length===0){
        fn(null,document);
    }else{

        var path = paths.shift();

        this._db.model(path.ref).populate(document,{
            "path":path.path
        },function(err,result){
            _.execPopulate(result,0,paths,fn);
        });
    }
}

module.exports = deepQuery;

