const db = require("../config/db");

const getMission = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM missions");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

module.exports = { getMission };
