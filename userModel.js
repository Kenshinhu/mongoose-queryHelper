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

m.model('my_users',userSchema);

exports.mongoose = s;