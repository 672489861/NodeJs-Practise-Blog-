/**
 * Created by zjw on 2016/12/28.
 */
var mongoose = require("../lib/mongo.js");

var Schema = mongoose.Schema;

var commentSchema = Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    content: {type: String},
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'post'},
    createDate: {type: Date, default: Date.now()}
});

// 查询文章留言数量
commentSchema.statics.getCommentsCount = function (postId) {
    return this.count({'postId': postId}).exec();
};

// 查询当前文章所有留言
commentSchema.statics.getComments = function (postId) {
    return this.find({'postId': postId}).populate('author').exec();
};

// 删除指定用户的某条留言
commentSchema.statics.delCommentById = function (authorId, commentId, cb) {
    this.remove({'author': authorId, '_id': commentId}, cb);
};

// 删除指定文章留言
commentSchema.statics.delCommentsByPostId = function (postId, cb) {
    this.remove({'postId': postId}, cb);
};

var commentModel = mongoose.model('comment', commentSchema);

module.exports = commentModel;