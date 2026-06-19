const db = require('../config/db');

const toAbsoluteAvatar = (req, iconImage) => {
  if (!iconImage) return null;
  if (iconImage.startsWith('http://') || iconImage.startsWith('https://')) return iconImage;
  return `${req.protocol}://${req.get('host')}${iconImage}`;
};

const ensureFriendRequestsTable = async () => {
  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      request_id INT AUTO_INCREMENT PRIMARY KEY,
      requester_user_id INT NOT NULL,
      receiver_user_id INT NOT NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_friend_request_requester FOREIGN KEY (requester_user_id) REFERENCES users(user_id),
      CONSTRAINT fk_friend_request_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(user_id),
      UNIQUE (requester_user_id, receiver_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const mapRequest = (req, row) => ({
  id: String(row.request_id),
  status: row.status,
  created_at: row.created_at,
  requester: {
    id: String(row.requester_user_id),
    name: row.user_name,
    handle: row.email,
    avatar: toAbsoluteAvatar(req, row.icon_image),
  },
});

const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    await ensureFriendRequestsTable();

    const [rows] = await db.promise().query(
      `
      SELECT fr.request_id, fr.requester_user_id, fr.status, fr.created_at,
             u.user_name, u.email, u.icon_image
      FROM friend_requests fr
      INNER JOIN users u ON u.user_id = fr.requester_user_id
      WHERE fr.receiver_user_id = ? AND fr.status = 'PENDING'
      ORDER BY fr.created_at DESC
      `,
      [userId],
    );

    return res.status(200).json({ requests: rows.map((row) => mapRequest(req, row)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    await ensureFriendRequestsTable();

    const [rows] = await db.promise().query(
      `
      SELECT fr.request_id, fr.receiver_user_id, fr.status, fr.created_at,
             u.user_name, u.email, u.icon_image
      FROM friend_requests fr
      INNER JOIN users u ON u.user_id = fr.receiver_user_id
      WHERE fr.requester_user_id = ? AND fr.status = 'PENDING'
      ORDER BY fr.created_at DESC
      `,
      [userId],
    );

    return res.status(200).json({ requests: rows.map((row) => ({
      id: String(row.request_id),
      status: row.status,
      created_at: row.created_at,
      receiver: {
        id: String(row.receiver_user_id),
        name: row.user_name,
        handle: row.email,
        avatar: toAbsoluteAvatar(req, row.icon_image),
      },
    })) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const requestId = Number(req.params.id);
    if (!requestId) return res.status(400).json({ message: 'request_id が必要です' });

    await ensureFriendRequestsTable();

    const [rows] = await db.promise().query(
      'SELECT * FROM friend_requests WHERE request_id = ? AND receiver_user_id = ? AND status = "PENDING"',
      [requestId, userId],
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: '承認対象のリクエストが見つかりません' });
    }

    const request = rows[0];

    await db.promise().query(
      `
      INSERT IGNORE INTO friend_relations (user_id, friend_user_id)
      VALUES (?, ?), (?, ?)
      `,
      [request.requester_user_id, request.receiver_user_id, request.receiver_user_id, request.requester_user_id],
    );

    await db.promise().query(
      'UPDATE friend_requests SET status = "ACCEPTED" WHERE request_id = ?',
      [requestId],
    );

    const [actorRows] = await db.promise().query('SELECT user_name FROM users WHERE user_id = ?', [userId]);
    const actorName = actorRows && actorRows[0] ? actorRows[0].user_name : null;

    await db.promise().query(
      'INSERT INTO notifications (user_id, actor_user_id, type, payload) VALUES (?, ?, ?, ?)',
      [request.requester_user_id, request.receiver_user_id, 'friend_request_accepted', JSON.stringify({ actor_name: actorName })],
    );

    return res.status(200).json({ message: '承認しました' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const requestId = Number(req.params.id);
    if (!requestId) return res.status(400).json({ message: 'request_id が必要です' });

    await ensureFriendRequestsTable();

    const [rows] = await db.promise().query(
      'SELECT * FROM friend_requests WHERE request_id = ? AND receiver_user_id = ? AND status = "PENDING"',
      [requestId, userId],
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: '拒否対象のリクエストが見つかりません' });
    }

    await db.promise().query(
      'UPDATE friend_requests SET status = "REJECTED" WHERE request_id = ?',
      [requestId],
    );
    return res.status(200).json({ message: '拒否しました' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = {
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
};
