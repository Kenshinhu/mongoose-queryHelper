/**
 * Created by jianxinhu on 15/4/28.
 */


var queryHelper = require('./index');
var userModel = require('./userModel');




// var comment = m.model('User', userSchema);




var q = new queryHelper("my_users",userModel.mongoose);

//query all data
//q.query().exec(function(err,result){
//    console.log(result);
//})

//query like by name
q.query({name:queryHelper.like("%Riley")}).exec(function(err,result){
    console.log(result);
});