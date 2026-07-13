const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");
const mypageRoutes = require("./routes/mypageRoutes");
const missionRoutes = require("./routes/missionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/missions", missionRoutes);
app.use("/api/notifications", notificationRoutes);

// const seedMissions = async () => {
//   try {
//     const [rows] = await db.promise().query("SELECT COUNT(*) AS count FROM missions");
//     if (rows[0].count === 0) {
//       console.log("ミッションが空のためシードデータを挿入します");
//       await db.promise().query(
//         `INSERT INTO missions (event_id, mission_title, mission_detail, reward_exp) VALUES
//           (1, '体育館の写真を撮ろう', '文化祭会場である体育館の写真を投稿してください', 100),
//           (1, '模擬店の写真を撮ろう', '好きな模擬店の写真を投稿してください', 150),
//           (1, 'クラスTシャツを投稿しよう', 'クラスTシャツが写るように撮影してください', 200)`
//       );
//     }
//   } catch (err) {
//     console.error("ミッションシード挿入中にエラー", err);
//   }
// };

// seedMissions();

app.get("/", (req, res) => {
  res.send("API起動中");
});

app.use("/api/auth", authRoutes);
app.use("/api/mypage", mypageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/friend-requests", friendRequestRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/groups", groupRoutes);

app.listen(3000, () => {
  console.log("起動");
});
