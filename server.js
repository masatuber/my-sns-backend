//http://localhost:3000/
const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");
const PORT = 3000;
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config( );
const cors = require('cors');
app.use(cors());
//データベース接続にenvファイルにDBURL格納しgit管理下にしない
mongoose
    .connect(process.env.MONGOURL)
    .then( ( ) =>{
        console.log("DBに接続中・・・");
    } )
    .catch( ( err ) => {        
  console.error("DB接続エラー:", err);
  process.exit(1); // エラー時にプロセス終了
    } );

// メモリ状況管理ログ
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
}, 5000);

//ミドルウェアにエンドポイントルーティング設定記述する。express.json()はJSON形式を指定
// /：3000/imagesを見に行ったら現在のディレクトリに＋public/imagesを参照する記述
app.use("/images", express.static(path.join(__dirname, "public/images/")));
//APIパスでVite環境は/api/を必ず付ける
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
//画像アップロード用のAPIエンドポイント
app.use("/api/upload", uploadRoute);

//　renderのスリーブ防止策、
app.get("/ping", (req, res) => {
  res.status(200).send("renderのスリーブ防止用");
});

//モンゴDB削除対策API, ユーザー数も返す
const User = require("./models/User");  // Userスキーマ読込
const { timeStamp, error } = require("console");

app.get("/ping/db", async (req, res) => {

  try {
   /* countDocuments カウントを返すためにメタデータを使用することはありません。代わりに、不正なシャットダウンが行われたり、
    シャーディングされたクラスターに孤立したドキュメントが存在したりしても、
    ドキュメントを集計して正確なカウントを返します。
    */
    const userCount = await User.countDocuments();
    res.status(200).json({
      message: "MongoDBにアクセス成功",
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
    // JSONでメッセージ、ユーザー数、時間を返す
  } catch (err) {
      console.error("ping/db エラー:", err);
      res.status(500).json({
        message: "MongoDBへのアクセス失敗",
        error: err.message
      });
  }

});

app.listen( PORT, () => console.log("サーバーが起動しました。"));
//サーバーの処理