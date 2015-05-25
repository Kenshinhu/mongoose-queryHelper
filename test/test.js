/**
 * Created by jianxinhu on 15/5/8.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/qh_test_data');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
var async = require('async');
var queryHelper = require('../index');


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
    favor      :[
        {
            type: ObjectId,
            ref: 'Favor'
        }
    ],

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


var qh = new queryHelper("Post",mongoose);

qh.query({"title":"orci luctus"}).exec(function(err,result){
    console.log(result);
})


