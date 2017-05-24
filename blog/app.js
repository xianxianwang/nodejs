var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');//请求网页的logo
var logger = require('morgan');//记录日志
var cookieParser = require('cookie-parser');//处理每一个请求的cookie
var bodyParser = require('body-parser');//post参数解析
var session = require('express-session');
var flash = require('connect-flash');//req.flash
//创建mongo和session回话机制
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');

var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(logger('dev'));//在终端显示不同颜色的日志
app.use(bodyParser.json());//解析json格式
//来解析body中的urlencoded字符， 只支持utf-8的编码的字符
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());//解释cookie

//设置静态文件目录
app.use(express.static(path.join(__dirname,'public')));

//session中间件
app.use(session({
	//设置cookie中保存session id 的字段名称
	name:'myblog',
	//通过设置secret来计算hash值并放在cookie中，使产生的signedCookie防篡改
	secret:'myblog',
	//过期时间，过期后cookie中的session id自动删除
	cookie:{maxAge:6000000},
	//将session存储到mongodb中
	store:new MongoStore({url:'mongodb://localhost/myblog'}),
	resave:false,
	saveUninitialized:true
}));
// flash 中间价，用来显示通知
app.use(flash());

app.use(function(req,res,next){
	res.locals.user = req.session.user;
	res.locals.success = req.flash('success').toString();
	res.locals.error = req.flash('error').toString();
	next();
});

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));

//设置路由
routes(app);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));


//catch 404  
app.use(function(req,res,next){
	var err = new Error('404 NOT FOUND');
	err.status = 404;
	next(err);
});
//error handle
app.use(function(err,req,res,next){
	//locals对象用于将数据传递至所渲染的模板中。
	//app.locals会在整个生命周期中起作用；
	//而res.locals只会有当前请求中起作用
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development'?err:{};

	res.status(err.status || 500);
	console.log('错误信息：',err.message);
	res.render('error');
});

if (module.parent) {
  module.exports = app;
} 
else {
  // 监听端口，启动程序
 app.listen(3000);
}
