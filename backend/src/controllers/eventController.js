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

    // イベントコード生成（例：EVT-AB12CD）
    const event_code =
      "EVT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const [result] = await db.promise().query(
      `
      INSERT INTO events
      (
        group_id,
        event_name,
        event_code
      )
      VALUES
      (?, ?, ?)
      `,
      [group_id, event_name, event_code],
    );

    res.status(201).json({
      message: "イベント作成成功",
      event_id: result.insertId,
      event_code,
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
        event_name,
        event_code
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

// イベント詳細取得
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        event_id,
        event_name,
        event_code
      FROM events
      WHERE event_id = ?
      `,
      [eventId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "イベントが見つかりません",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

const joinEventByCode = async (req, res) => {
  try {
    const { event_code } = req.body;

    const [rows] = await db.promise().query(
      `
  SELECT
    e.event_id,
    e.event_name,
    e.event_code,
    e.group_id,
    c.group_name
FROM events e
JOIN community_groups c
ON e.group_id = c.group_id
WHERE e.event_code = ?
  `,
      [event_code],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "イベントが見つかりません",
      });
    }

    res.json(rows[0]);
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
  getEventById,
  joinEventByCode,
};
