require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API起動");
});

app.listen(process.env.PORT, () => {
  console.log("起動");
});
