const db = require('../config/db');

const toAbsoluteAvatar = (req, iconImage) => {
  if (!iconImage) return null;
  if (iconImage.startsWith('http://') || iconImage.startsWith('https://')) return iconImage;
  return `${req.protocol}://${req.get('host')}${iconImage}`;
};

const parsePayload = (payload) => {
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch (error) {
    console.warn('通知 payload の解析に失敗しました', error);
    return null;
  }
};

const mapNotification = (req, row) => ({
  id: String(row.notification_id),
  type: row.type,
  payload: parsePayload(row.payload),
  is_read: Boolean(row.is_read),
  created_at: row.created_at,
  actor: row.actor_id ? {
    id: String(row.actor_id),
    name: row.actor_name,
    avatar: toAbsoluteAvatar(req, row.actor_icon),
  } : null,
});

const getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const [rows] = await db.promise().query(
      `
      SELECT n.notification_id, n.type, n.payload, n.is_read, n.created_at,
             a.user_id AS actor_id, a.user_name AS actor_name, a.icon_image AS actor_icon
      FROM notifications n
      LEFT JOIN users a ON a.user_id = n.actor_user_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
      `,
      [userId],
    );
    return res.status(200).json({ notifications: rows.map((r) => mapNotification(req, r)) });
  } catch (err) {
    console.error('getNotifications error', err);
    // If notifications table missing, attempt to create it and retry once
    if (err && err.code === 'ER_NO_SUCH_TABLE') {
      try {
        await db.promise().query(`
          CREATE TABLE IF NOT EXISTS notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            actor_user_id INT,
            type VARCHAR(50) NOT NULL,
            payload TEXT,
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        // retry
        const [rows2] = await db.promise().query(
          `
          SELECT n.notification_id, n.type, n.payload, n.is_read, n.created_at,
                 a.user_id AS actor_id, a.user_name AS actor_name, a.icon_image AS actor_icon
          FROM notifications n
          LEFT JOIN users a ON a.user_id = n.actor_user_id
          WHERE n.user_id = ?
          ORDER BY n.created_at DESC
          LIMIT 50
          `,
          [userId],
        );
        return res.status(200).json({ notifications: rows2.map((r) => mapNotification(req, r)) });
      } catch (err2) {
        console.error('getNotifications retry/create table failed', err2);
      }
    }
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const notificationId = Number(req.params.id);
    if (!notificationId) return res.status(400).json({ message: '通知IDが必要です' });

    await db.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId],
    );

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
