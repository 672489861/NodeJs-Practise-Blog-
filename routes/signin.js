/**
 * Created by zjw on 2016/12/27.
 */
var express = require('express'), sha1 = require('sha1'), userModel = require('../models/user.js');
var router = express.Router();

var checkNotLogin = require('../middlewares/check.js').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res) {
    res.render('signin');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res) {
    var name = req.fields.name;
    var password = req.fields.password;
    userModel.find({"name": name}, function (err, result) {
        if (err) {
            req.flash('error', '遇到错误，请稍后再试');
            return res.redirect('back'); // 返回之前页面
        }
        if (result.length == 1) {
            if (sha1(password) != result[0].password) {
                req.flash('error', '用户名或密码错误');
                return res.redirect('back');
            } else {
                req.flash('success', '登录成功');
                // 用户信息写入 session 回到主页
                delete result.password;
                req.session.user = result[0];
                res.redirect('/posts');
            }
        } else {
            req.flash('error', '该用户不存在');
            return res.redirect('back');
        }
    });
});

module.exports = router;