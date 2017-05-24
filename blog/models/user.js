var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username:String,
	password:String,
	email:String,
	gender:String
});
//mongoose是通过model来创建mongodb中对应的collection
//mongoose在内部创建collection时将我们传递的collection名小写化，
//同时如果小写化的名称后面没有字母 s,则会在其后面添加 s
var User = mongoose.model('User',userSchema);


module.exports = User;
