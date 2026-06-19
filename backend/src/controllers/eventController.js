const db = require("../config/db");

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
  getEventsByGroup,
};
