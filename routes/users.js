//CRUDを実装、DBと連携し更新、削除、取得、フォロー、フォロー解除処理記述
const router = require("express").Router( );
const User = require("../models/User");

//ユーザー情報の更新DBに格納されるランダムなIDがURL/の後に来る、isAdminはデータスキーマより認証前後で条件分岐させる
router.put("/:id", async (req, res) => {
    if(req.body.userid === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
            //全てのユーザーパラメータ取得
                $set: req.body,
            });
            //ステータス200を返す
            res.status(200).json("ユーザー情報が更新されました");

        } catch(err) {
            //他のユーザーはエラーメッセージが返される
            return res
                .status(500)
                .json(err);
        }
    } else {
        return res
            .status(403)
            .json("あなたは自分のアカウントの時だけ情報を更新できます");
    }
});

//ユーザー情報の削除
router.delete("/:id", async (req, res) => {
    if(req.body.userid === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id).select("userid isAdmin");
            //ステータス200を返す
            res.status(200).json("ユーザー情報が削除されました");

        } catch(err) {
            //他のユーザーはエラーメッセージが返される
            return res
                .status(500)
                .json(err);
        }
    } else {
        return res
            .status(403)
            .json("あなたは自分のアカウントの時だけ情報を削除できます");
    }
});

//ユーザー情報の取得
// router.get("/:id", async (req, res) => {
// //投稿タイムラインの識別を行う
//         try {
//             //ステータス200を返しユーザー情報を表示する
//             const user = await User.findById(req.params.id);
//             //分割代入でDBからユーザー情報取得するためにPW、updatedAtを除いた情報取得する
//             const { password, updatedAt, ...other } = user._doc;
//             return res.status(200).json(other);

//         } catch(err) {
//             //他のユーザーはエラーメッセージが返される
//             return res
//                 .status(500)
//                 .json(err);
//         }
// });

//新しく作成 クエリでユーザー情報を取得
router.get("/", async (req, res) => {
    //~?「userid=hoge」から参照出来るようにする
    const userId = req.query.userid;
    //?username=hegeを参照出来るようにする
    const username = req.query.username;
        try {
            const user = userId
            //.select()不要なフィールドを除外,.lean()生のJSオブジェクトとして取得
                ? await User.findById(userId)
                : await User.findOne({username: username});
            //分割代入でDBからユーザー情報取得するためにPW、updatedAtを除いた情報取得する
            const { password, updatedAt, ...other } = user._doc;
            return res.status(200).json(other);
        } catch(err) {
            //他のユーザーはエラーメッセージが返される
            return res
                .status(500)
                .json(err);
        }
});



//ユーザーのフォローuseridと等しくない時がフォロー出来る条件分岐、followersはデータスキーマより参照する(配列で定義したのでinclude（）が使用可能)
// ・事前にドキュメントを取得せず、updateOneの条件に $ne を使用して、すでにフォローしているかをクエリ側で判断
router.put("/:id/follow", async (req, res) => {
    if (req.body.userid !== req.params.id) {
        try {
            // 対象ユーザーの followers 配列に、すでに自分のIDが含まれていなければ更新
            const followResult = await User.updateOne(
                { _id: req.params.id, followers: { $ne: req.body.userid } },
                { $push: { followers: req.body.userid } }
            );
            if (followResult.modifiedCount > 0) {
                // 自分の followings 配列にも対象ユーザーのIDを追加
                await User.updateOne(
                    { _id: req.body.userid },
                    { $push: { followings: req.params.id } }
                );
                return res.status(200).json("フォローしました!");
            } else {
                return res.status(403).json("あなたはすでにこのユーザーをフォローしています");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォロー出来ません");
    }
});


//ユーザーのfollowを解除する処理
// ・updateOne の条件に $in を利用して、対象ユーザーの followers 配列に自分のIDが存在する場合のみ更新
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userid !== req.params.id) {
        try {
            const unfollowResult = await User.updateOne(
                { _id: req.params.id, followers: { $in: [req.body.userid] } },
                { $pull: { followers: req.body.userid } }
            );
            if (unfollowResult.modifiedCount > 0) {
                // 自分の followings 配列から対象ユーザーのIDを削除
                await User.updateOne(
                    { _id: req.body.userid },
                    { $pull: { followings: req.params.id } }
                );
                return res.status(200).json("フォローを解除しました!");
            } else {
                return res.status(403).json("このユーザーはフォロー解除出来ません");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォロー解除出来ません");
    }
});

module.exports = router;
//モジュールエクスポートはrouter