const db = require("../config/db");

const formatPost = (req, row) => ({
  post_id: row.post_id,
  caption: row.caption,
  post_created_at: row.post_created_at,
  submission_id: row.submission_id,
  submission_comment: row.submission_comment,
  submitted_at: row.submitted_at,
  mission_id: row.mission_id,
  mission_title: row.mission_title,
  event_id: row.event_id,
  event_name: row.event_name,
  user: {
    user_id: row.user_id,
    user_name: row.user_name,
    icon_image: row.icon_image ? `${req.protocol}://${req.get("host")}${row.icon_image}` : null,
  },
  photo_url: row.photo_path ? `${req.protocol}://${req.get("host")}${row.photo_path}` : null,
});

const getCommunityFeed = async (req, res) => {
  try {
    const eventId = Number(req.query.event_id);

    if (!eventId) {
      return res.status(400).json({ message: "event_id が必要です" });
    }

    const [rows] = await db.promise().query(
      `
      SELECT
        p.post_id,
        p.caption,
        p.created_at AS post_created_at,
        ms.submission_id,
        ms.comment AS submission_comment,
        ms.submitted_at,
        m.mission_id,
        m.mission_title,
        e.event_id,
        e.event_name,
        u.user_id,
        u.user_name,
        u.icon_image,
        ms.photo_path
      FROM posts p
      INNER JOIN mission_submissions ms
        ON p.submission_id = ms.submission_id
      INNER JOIN missions m
        ON ms.mission_id = m.mission_id
      INNER JOIN events e
        ON m.event_id = e.event_id
      INNER JOIN users u
        ON p.user_id = u.user_id
      WHERE e.event_id = ?
      ORDER BY p.created_at DESC
      `,
      [eventId],
    );

    return res.status(200).json({
      posts: rows.map((row) => formatPost(req, row)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "サーバーエラー" });
  }
};

module.exports = {
  getCommunityFeed,
};