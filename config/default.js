/**
 * Created by zjw on 2016/12/27.
 */
module.exports = {
    port: 8080,
    session: {
        secret: 'myblog',
        key: 'myblog',
        maxAge: 864000000
    },
    mongodb: 'mongodb://localhost:27017/myblog'
};