const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");
const mypageRoutes = require("./routes/mypageRoutes");
const missionRoutes = require("./routes/missionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/missions", missionRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("API起動中");
});

app.use("/api/auth", authRoutes);
app.use("/api/mypage", mypageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/friend-requests", friendRequestRoutes);

app.listen(3000, () => {
  console.log("起動");
});
