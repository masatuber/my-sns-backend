//投稿に必要なデータschemaを定義する
//descriptionはdesc変数定義
//likesは誰がいいねをクリックしたのかを格納するため配列で定義
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
        userid: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            max: 300,
        },
        img: {
            type: String,
        },
        likes: {
            type: Array,
            default: [ ],
        },
    },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
// PostSchemaをexportする