const db = require("../config/db");

const getMission = async (req, res) => {
  try {
    const { event_id } = req.query;

    const [rows] = await db
      .promise()
      .query("SELECT * FROM missions WHERE event_id = ?", [event_id]);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

const createMission = async (req, res) => {
  try {
    const { event_id, mission_title, mission_detail, reward_exp } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO missions
      (event_id, mission_title, mission_detail, reward_exp)
      VALUES (?, ?, ?, ?)`,
      [event_id, mission_title, mission_detail, reward_exp],
    );

    res.status(201).json({
      message: "ミッション作成成功",
      mission_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

module.exports = {
  getMission,
  createMission,
};
