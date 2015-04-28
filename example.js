/**
 * Created by jianxinhu on 15/4/28.
 */


var queryHelper = require('./index');


var m = require('mongoose');
    m.connect('mongodb://localhost/mock_data');

var s = m.Schema;

var userSchema = new s({
    name:String,
    password:String,
    mobile:String,
    status:Boolean,
    createTime:Date
});

// var comment = m.model('User', userSchema);

m.model('my_users',userSchema);


var q = new queryHelper("my_users");
q.query().exec(function(err,result){
    console.log(result);
})