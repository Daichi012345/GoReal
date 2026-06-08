const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API起動中");
});

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("起動");
});
