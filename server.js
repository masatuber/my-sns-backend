//http://localhost:3000/
const express = require("express");
const app = express( );
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

app.listen( PORT, () => console.log("サーバーが起動しました。"));
//サーバーの処理