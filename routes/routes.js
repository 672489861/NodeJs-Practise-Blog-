/**
 * Created by zjw on 2016/12/27.
 */
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.redirect('/posts');
    });

    app.use('/signup', require('./signup.js'));
    app.use('/signin', require('./signin.js'));
    app.use('/signout', require('./signout.js'));
    app.use('/posts', require('./posts.js'));

    // 404处理
    app.use(function (req, res) {
        if (!res.headersSent) {
            res.render('404', {
                blog: {
                    title: "找不到该页面"
                }
            });
        }
    });
};