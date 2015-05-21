/**
 * Created by jianxinhu on 15/4/30.
 */
var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/qh_test_data');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
var async = require('async');
//var queryHelper = require('./index');

var favorSchema = new Schema({
    title:String,
    follower:{ type: ObjectId, ref: 'Person'}
});

var personSchema = new Schema({
    first_name : String,
    last_name  : String,
    email      : String,
    country    : String,
    from       : String,
    ip_address : String,
    createAt   : {type:String,default:Date.now}
});

var commentSchema = new Schema({
    comment : String,
    poster: { type: ObjectId, ref: 'Person'},
    createAt   : {type:String,default:Date.now}
});

var postSchema = new Schema({
    title: String,
    content:{type:String},
    poster: { type: ObjectId, ref: 'Person'  },
    comments:[{ type: ObjectId, ref: 'Comment'}],
    createAt   : {type:String,default:Date.now}

});

var Person = mongoose.model('Person', personSchema);
var Comment = mongoose.model('Comment', commentSchema);
var Post = mongoose.model('Post', postSchema);
var Favor = mongoose.model('Favor', favorSchema);

var personMock = require('./personMockData.json');
var postMock = require('./postMockData.json');
var postCommentMock = require('./postCommentMock.json');


//清空数据
function clearData(fn){
    Person.remove({},function(err,result){
        Post.remove({},function(err,result){
            Comment.remove({},function(err,result){
                fn();
            });
        });
    });
}


//生成模拟数据
function mockData(){

    var PersonData = [],PostData = [];

    async.eachSeries(personMock,function(item,next){

        Person.create(item,function(err,result){

            PersonData.push(result);

            next(err,result);
        });

    },function(err,result){

        if(err)
            console.log("save Person is Error : %s ",err);

        console.log("person %s",result);

        async.eachSeries(postMock,function(item,next){

            var personIndex = Math.floor(Math.random()*1000);

            var p = PersonData[personIndex];

            var post = item;
            post.poster = p;

            Post.create(post,function(err,result){

                PostData.push(result);

                next(err,result);
            });

        },function(err,result){

            async.eachSeries(postCommentMock,function(item,next){

                var comment = item;

                var personIndex = Math.floor(Math.random()*1000);

                var p = PersonData[personIndex];

                comment.poster = p;

                Comment.create(comment,function(err,result){

                    //更新 Post

                    var post = PostData[Math.floor(Math.random()*1000)];

                    post.comments.push(result);

                    post.save(function(err,result){

                        next(err,result);
                    });


                });
            },function(err){
                console.log("complete");
            })

        })

    });
}

clearData(function(){
    console.log("clear is ok");

    mockData();
});






