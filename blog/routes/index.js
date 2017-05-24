var mongoose = require('mongoose');
var config = require('./../config/config');
var path = require('path');
markdown = require('markdown').markdown;
mongoose.connect(config.mongodb,function(err,db){
  console.log('连接成功');
});

var User = require('./../models/user');
var Post = require('./../models/post');

var moment = require('moment');//时间控件
var formidable = require('formidable');//表单控件

var checkLogin = require('./../middlewares/check').checkLogin;
var checkNotLogin = require('./../middlewares/check').checkNotLogin;

module.exports = function(app){
	app.get('/',function(req,res,next){
    Post.find({},function(err,data){
        if(err){
            //console.log(err);
            req.flash('error','查找错误');
            return res.redirect('/');
        }
        res.render('index',{
            title:'首页',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            posts:data,
            time:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        });
    });
  });

	app.get('/signup',function(req,res){
    console.log('开始注册');
		res.render('signup',{title:'注册'});
	});

	app.post('/signup',function(req,res){
		var user = new User({
			username:req.body.username,
			password:req.body.password,
			email:req.body.email,
			gender:req.body.gender
		});
		if(!username.length >=1 && username.length <= 10){
			console.log('名字请限制在1-10个字符');
			return redirect('/');
		}
		if(['b','g'].indexOf(gender) === -1){
			console.log('性别只能是 b,g');
      return res.redirect('/');//返回注册页
		}
		if(password.length < 6){
			console.log('密码至少6个字符');
      return res.redirect('/');//返回注册页
		}
		if(req.body['password'] != req.body['password-repeat']){
			console.log('两次输入的密码不一致');
			return res.redirect('/');//返回注册页
      //req.flash("error",'两次输入的密码不一致'); 	
    }
    User.findOne({'username':user.username},function(err,data){
      if(data != null){
        console.log('该用户已存在');
        return res.redirect('/signup');
      }
      else{
        user.save(function(err){
          if(err){
            console.log(err);
            return redirect('/');
          }
          console.log('注册成功');
          res.redirect('/');
        });
      }
    });
  });


	app.get('/signin',function(req,res){
		res.render('signin',{title:'登录'});
	});

	app.post('/signin',checkNotLogin,function (req, res){
    var password = req.body.password;
		//检查用户是否存在
    User.findOne({'username':req.body.username},function(err,user){
      if(err){
        console.log('error','登录出错');
        req.flash('error','登录出错');
        return res.redirect('/');
      }
      //用户不存在
      if(!user){
        console.log('error','用户不存在');
        req.flash('error','用户不存在');
        return res.redirect('/signin');
      }
      //判断密码是否一致
      if(user.password != password){
        console.log('error','密码错误');
        req.flash('error','密码错误');
        return res.redirect('/');
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      console.log(user.username);
      req.flash('success','登录成功');
      res.redirect('/');
    });
  });

	app.get('/post',checkLogin,function(req,res){
		res.render('post',{
			title:'发表文章',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});

	app.post('/post',checkLogin,function(req,res,next){
    var imgPath =  path.dirname(__dirname) + '/public/images/';
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = imgPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','图片上传失败');
            return;
        }
        var file = files.postImg;//获取上传文件信息
        if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif' && file.type != 'image/jpg'){
            console.log('上传文件格式错误，只支持png,jpeg,gif,jpg');
            req.flash('error','上传文件格式错误，只支持png,jpeg,gif,jpg');
            return res.redirect('/post');
        }
        var title = fields.title;
        var author = req.session.user.username;
        var article = fields.article;
        var postImg = files.postImg.path.split(path.sep).pop();
        var pv = fields.pv;
        // 校验参数
        try {
            if (!title.length) {
              throw new Error('请填写标题');
            }
            if (!article.length) {
              throw new Error('请填写内容');
            }
        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }
        var post = new Post({
            title:title,
            author:author,
            article:article,
            postImg:postImg,
            publishTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
            pv:pv
        });
        post.save(function(err){
            if(err){
                console.log('文章发表出现错误');
                req.flash('err','文章发表出现错误');
                return res.redirect('/post');
            }
            console.log('文章录入成功');
            req.flash('success','文章录入成功');
            res.redirect('/');
        });
    });
  });

	app.get('/signout',checkLogin,function(req,res){
		req.session.user = null;
		console.log('success','退出成功');
		res.redirect('/');
	});

	//展示文章
  app.get('/detail',function(req,res,next){
    var id = req.query.id;
    if(id && id !=''){
      Post.update({"_id":id},{$inc:{"pv":1}},function(err){
        if(err){
          console.log(err);
          return res.redirect("back");
        }
        console.log("浏览数量+1");
      });

      Post.findById(id,function(err,data){
        if(err){
          console.log(err);
          return res.redirect('/');
        }
        res.render('detail',{
          title:'文章展示',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          post:data,
          img:path.dirname(__dirname) + '/public/images/'+data.postImg
        });
      });
    }
  });

  //编辑文件
  app.get('/edit/:author/:title',checkLogin, function (req, res) {
    var id = req.query.id;
    Post.findById(id, function (err, data) {
      //console.log(data);
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post("/edit/:author/:title",checkLogin,function(req,res,next){
    var post = {
      id:req.body.id,
      author:req.session.user,
      title:req.body.title,
      article:req.body.article
    };

    console.log(post);

    //markdow转格式文章
    post.article = markdown.toHTML(post.article);


    Post.update({"_id":post.id},{$set:{title:post.title,article:post.article}},function(err){
      if(err){
        console.log(err);
        return;
      }
      console.log("更新成功");
      res.redirect("/");
    });
  });

  //删除文件
  app.get('/delete',checkLogin,function(req,res){
    var id = req.query.id;
    console.log(id);
    if(id && id!=''){
      Post.findByIdAndRemove(id,function(err){
        if(err){
          console.log(err);
          req.flash("success","删除文章失败");
          return req.redirect('/');
        }
        req.flash("success","删除文章成功");
        res.redirect('/');
      });
    }
  });

}