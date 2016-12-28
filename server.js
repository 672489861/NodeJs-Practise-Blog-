/**
 * Created by zjw on 2016/12/27.
 */
var express = require('express'), session = require('express-session');
var MongoStore = require('connect-mongo')(session); // 将 session 存储于 mongodb，结合 express-session 使用
var flash = require('connect-flash'), config = require('config-lite'); // 默认读取config目录下的default.js
var winston = require('winston'), expressWinston = require('express-winston'); // 日志处理
var path = require('path'), routes = require('./routes/routes.js');
var pkg = require('./package.json');

var app = express();

// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 一定要注意中间件和路由的顺序

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件会在 req 上添加 session 对象，即 req.session 初始值为 {} 当我们登录后设置 req.session.user = 用户信息
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({ // 将 session 存储到 mongodb
        url: config.mongodb // mongodb 地址
    })
}));
// flash 中间价，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/upload'), // 上传文件目录
    keepExtensions: true // 保留后缀
}));

// 设置模板全局常量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
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
            filename: './logs/success.log'
        })
    ]
}));

// 注册路由
routes(app);

// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: './logs/error.log'
        })
    ]
}));

// 错误处理
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});

// 启动服务器 监听8080端口
app.listen(config.port);

