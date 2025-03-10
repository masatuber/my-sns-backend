const router = require("express").Router( );
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name); //file.originalnameではパスが通らないreq.bodyに格納された値を参照する
  },
}); 

const upload = multer({storage: storage});
//画像アップロード用のAPI
router.post("/", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("画像アップロードに成功しました");
  } catch(err) {
    console.log(err);
  }
});

module.exports = router;