const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const mypageRoutes = require("./routes/mypageRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("API起動中");
});

app.use("/api/auth", authRoutes);
app.use("/api/mypage", mypageRoutes);
app.use("/api/friends", friendRoutes);

app.listen(3000, () => {
  console.log("起動");
});
