/**
 * Created by jianxinhu on 15/4/30.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
var async = require('async');
var queryHelper = require('./index');
mongoose.connect('mongodb://localhost/qh_test_data');

//var personSchema = new Schema({ name: String, birthName: String });

var postSchema = new Schema({
    title: String,
    content:{type:String},
    poster: { type: ObjectId, ref: 'Person'  },
    createAt:{ type:String, default:Date.now}
});

var Post = mongoose.model('Post', postSchema);
var Person = mongoose.model('Person', postSchema);

var PostMockData = require("./test/postMockData.json");

//Post.schema.eachPath(function(pathName,schemaType){
//    console.log("========= start");
//    console.log(arguments);
//    console.log("========= end");
//});




//Person.find({}).exec(function(err,result){
//
//    var person = result;
//
//    //for(var )
//
//    async.eachSeries(PostMockData,function(item,next){
//
//        item.poster = person[Math.floor((Math.random() * person.length) + 1)];
//
//
//
//        Post.create(item,function(err){
//
//            err ? next(err) : next();
//        });
//
//    },function(err){
//
//        if(err)
//            console.log("err : %s",JSON.stringify(err,'','\t'));
//
//        console.log("complete");
//
//
//    })
//
//});
//
//
//function()

//Post.create({})


//Post.find({})
//    .populate(
//            {path:'poster',  model : 'Person' }
//    )
//    .limit(2)
//    .exec(function(err,result){
//
//    console.log(result);
//
//});

//console.log(Post.find().schema);


//function _populate(query){
//
//    var q = query;
//
//    var s = q.schema;
//
//    s.eachPath(function(pathName,schemaType){
//
//        if (schemaType.options && (typeof schemaType.options.type === "function") && schemaType.options.hasOwnProperty("ref")) {
//
//            q.populate(
//                {path:pathName}
//            );
//        }
//
//    });
//
//    return q;
//}

//_populate(Post.find()).limit(2).exec(function(err,result){
//    console.log(result);
//});



var Post = new queryHelper("Post");

Post.query().exec(function(err,result){

    console.log(result)

});