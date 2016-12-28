/**
 * Created by zjw on 2016/12/27.
 */
var express = require('express'), path = require('path'),
    sha1 = require('sha1'), fs = require("fs"), userModel = require('../models/user.js');
var router = express.Router();

// GET /signup 注册页
router.get('/', function (req, res) {
    res.render('signup');
});

// Post /signup 用户注册
router.post('/', function (req, res) {
    var name = req.fields.name;
    var gender = req.fields.gender;
    var bio = req.fields.bio;
    var avatar = req.files.avatar.path.split(path.sep).pop();
    var password = req.fields.password;
    var repassword = req.fields.repassword;
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (!req.files.avatar.name) {
            throw new Error('缺少头像');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path);
        res.render("signup.ejs", {
            error: e.message
        });
    }
    // 明文密码加密
    password = sha1(password);
    // 待写入数据库的用户信息
    var user = new userModel({
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    });
    user.save(function (err) {  //存储
        if (err) {
            // 注册失败，异步删除上传的头像
            fs.unlink(req.files.avatar.path);
            // 用户名被占用 则跳回注册页，而不是错误页
            if (err.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                res.redirect('/signup');
            }
        } else {
            req.flash('success', '注册成功');
            res.redirect('/signin');
        }
    });
});

module.exports = router;