const db = require("../config/db");

// イベント作成
const createEvent = async (req, res) => {
  try {
    const { group_id, event_name } = req.body;

    if (!group_id || !event_name) {
      return res.status(400).json({
        message: "入力項目不足",
      });
    }

    const [result] = await db.promise().query(
      `
      INSERT INTO events
      (
        group_id,
        event_name
      )
      VALUES
      (?, ?)
      `,
      [group_id, event_name],
    );

    res.status(201).json({
      message: "イベント作成成功",
      event_id: result.insertId,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

const getEventsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const [events] = await db.promise().query(
      `
      SELECT
        event_id,
        event_name
      FROM events
      WHERE group_id = ?
      ORDER BY event_id DESC
      `,
      [groupId],
    );

    res.status(200).json(events);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

module.exports = {
  createEvent,
  getEventsByGroup,
};
