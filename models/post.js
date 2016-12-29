/**
 * Created by zjw on 2016/12/28.
 */
var mongoose = require("../lib/mongo.js");

var Schema = mongoose.Schema;

var postSchema = Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    title: {type: String},
    content: {type: String},
    pv: {type: Number, default: 0},
    commentsCount: {type: Number, default: 0},
    createDate: {type: Date, default: Date.now()}
});

// a setter
postSchema.path('content').set(function (v) {
    console.log(' ------> mongoose setter of todoSchema: ', v);
    return v;
});

//a getter method
postSchema.path('content').get(function (v) {
    console.log(' ------> mongoose getter of todoSchema: ', v);
    return v;
});

// 中间件定义
postSchema.pre('remove', function (next) {
    console.log('------> mogoose middleware remove of todoSchema: ', postSchema);
    next();
});

postSchema.pre('validate', function (next) {
    console.log('------> mogoose middleware validate of todoSchema: ', postSchema);
    next();
});

postSchema.post('init', function (doc) {
    console.log('%s has been initialized from the db', doc._id);
});

postSchema.post('validate', function (doc) {
    console.log('%s has been validated (but not saved yet)', doc._id);
});

postSchema.post('save', function (doc) {
    console.log('%s has been saved', doc._id);
});

postSchema.post('remove', function (doc) {
    console.log('%s has been removed', doc._id);
});

// 供Model层调用的静态方法
postSchema.statics.findByAuthor = function (queryObj, cb) {
    // 子表关联主表查询，populate里面为子表外键
    this.find(queryObj).populate('author').sort({createDate: -1}).exec(cb);
};

// 查询指定文章
postSchema.statics.getPostById = function (postId) {
    return this.find({'_id': postId}).populate('author').exec();
};

// 阅读量变更
postSchema.statics.incPv = function (postId) {
    this.update({_id: postId}, {$inc: {pv: 1}}, function (err, post) {
    });
};

// 删除文章
postSchema.statics.delPostById = function (postId, author, cb) {
    this.remove({_id: postId, author: author}, cb);
};

// 更新指定文章
postSchema.statics.updatePostById = function (postId, author, updateDatas, cb) {
    this.update({_id: postId, author: author}, {$set: updateDatas}, cb);
};

var postModel = mongoose.model('post', postSchema);

module.exports = postModel;