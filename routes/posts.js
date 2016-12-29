/**
 * Created by zjw on 2016/12/27.
 */
var express = require("express"), postModel = require("../models/post.js"),
    commentModel = require("../models/comment.js");
var router = express.Router();

var checkLogin = require('../middlewares/check.js').checkLogin;

// GET /posts or /posts?author=xxx所有用户或者特定用户的文章页
router.get('/', function (req, res, next) {
    var author = req.query.author;
    var query = {};
    if (author) {
        query.author = author;
    }
    postModel.findByAuthor(query, function (err, posts) {
        if (err) {
            req.flash('error', '遇到错误，请稍后再试');
            return res.redirect('back'); // 返回之前页面
        }
        Promise.all(posts.map(function (post) {
            return commentModel.getCommentsCount(post._id).then(function (commentsCount) {
                post.commentsCount = commentsCount;
                return post;
            });
        })).then(function (result) {
            res.render('posts', {
                posts: result
            });
        });
    });
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res) {
    res.render('create');
});


// POST /posts 发表一篇文章
router.post("/create", checkLogin, function (req, res) {
    var title = req.fields.title;
    var content = req.fields.content;
    // 校验
    try {
        if (!title) {
            throw new Error('请填写标题');
        }
        if (!content) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }
    var post = new postModel({author: req.session.user._id, title: title, content: content, pv: 0});
    post.save(function (err, result) {
        if (err) {
            throw err;
        }
        req.flash('success', '发表成功');
        res.redirect('/posts');
    });
});

// GET /posts/文章ID  查看指定文章
router.get('/:postId', function (req, res, next) {
    var postId = req.params.postId;
    // ES6 Promise
    Promise.all([
        postModel.getPostById(postId),// 获取文章信息
        commentModel.getComments(postId),// 获取该文章所有留言
        postModel.incPv(postId)// pv 加 1
    ]).then(function (result) {
        var post = result[0];
        var comments = result[1];
        if (!post) {
            throw new Error("该文章不存在");
        }
        res.render("post", {
            post: post[0],
            comments: comments
        });
    }).catch(function (reason) {
    });
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    postModel.delPostById(postId, author, function (err, result) {
        if (!err) {
            // 删除所有留言
            commentModel.delCommentsByPostId(postId, function (err, result) {
                req.flash('success', '删除文章成功');
                // 删除成功后跳转到主页
                res.redirect('/posts');
            });
        }
    });
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    postModel.getPostById(postId).then(function (post) {
        if (!post || post.length == 0) {
            throw new Error('该文章不存在');
        }
        if (author.toString() !== post[0].author._id.toString()) {
            throw new Error('权限不足');
        }
        res.render('edit', {
            post: post[0]
        });
    });
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    postModel.updatePostById(postId, author, {title: title, content: content}, function (err, result) {
        req.flash('success', '编辑文章成功');
        // 编辑成功后跳转到上一页
        res.redirect(`/posts/${postId}`);
    });
});

// POST /posts/:postId/comment 创建一条留言
router.post("/:postId/comment", checkLogin, function (req, res) {
    var author = req.session.user._id;
    var postId = req.params.postId;
    var content = req.fields.content;

    var comment = new commentModel({author: author, content: content, postId: postId});
    comment.save(function (err, result) {
        if (err) {
            throw err;
        }
        req.flash('success', '留言成功');
        // 留言成功后回到上一页  (访问量目前是每访问1次就+1)
        res.redirect('back');
    });
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get("/:postId/comment/:commentId/remove", checkLogin, function (req, res) {
    var commentId = req.params.commentId;
    var authorId = req.session.user._id;

    commentModel.delCommentById(authorId, commentId, function (err, comment) {
        if (!err) {
            req.flash('success', '删除留言成功');
            // 删除留言成功后回到上一页
            res.redirect('back');
        }
    });
});

module.exports = router;