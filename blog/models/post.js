var mongoose = require('mongoose');
 
var postSchema = new mongoose.Schema({
	title:String,//标题
	author:String,//作者
	article:String,//文章
	publishTime:String,//发表时间
	PostImg:String,//封面
	comments:[{
		name:String,
		time:String,
		content:String
	}],//评论
	pv:Number//访问次数
});
var Post = mongoose.model('Post',postSchema);

module.exports = Post;
