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

const mapUser = (req, row) => ({
  id: String(row.user_id),
  name: row.user_name,
  handle: row.email,
  avatar: toAbsoluteAvatar(req, row.icon_image),
});

const getFriendIds = async (userId) => {
  const [rows] = await db.promise().query(
    'SELECT friend_user_id FROM friend_relations WHERE user_id = ?',
    [userId],
  );
  return rows.map((row) => row.friend_user_id);
};

const getFriends = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const [rows] = await db.promise().query(
      `
      SELECT u.user_id, u.user_name, u.email, u.icon_image
      FROM friend_relations fr
      INNER JOIN users u ON u.user_id = fr.friend_user_id
      WHERE fr.user_id = ?
      ORDER BY u.user_name ASC
      `,
      [userId],
    );

    return res.status(200).json({ friends: rows.map((row) => mapUser(req, row)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const friendIds = await getFriendIds(userId);
    const params = [userId];
    let sql = `
      SELECT user_id, user_name, email, icon_image
      FROM users
      WHERE user_id <> ?
    `;

    if (friendIds.length > 0) {
      sql += ` AND user_id NOT IN (${friendIds.map(() => '?').join(',')})`;
      params.push(...friendIds);
    }

    sql += ' ORDER BY created_at DESC LIMIT 20';

    const [rows] = await db.promise().query(sql, params);

    return res.status(200).json({ users: rows.map((row) => mapUser(req, row)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const addFriend = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const friendUserId = Number(req.body.friend_user_id);
    if (!friendUserId || Number.isNaN(friendUserId)) {
      return res.status(400).json({ message: 'friend_user_id が必要です' });
    }

    if (friendUserId === Number(userId)) {
      return res.status(400).json({ message: '自分自身は追加できません' });
    }

    const [targetRows] = await db.promise().query(
      'SELECT user_id, user_name, email, icon_image FROM users WHERE user_id = ?',
      [friendUserId],
    );

    if (targetRows.length === 0) {
      return res.status(404).json({ message: '追加対象のユーザーが見つかりません' });
    }

    const [relationRows] = await db.promise().query(
      `SELECT 1 FROM friend_relations
       WHERE (user_id = ? AND friend_user_id = ?) OR (user_id = ? AND friend_user_id = ?)
       LIMIT 1`,
      [userId, friendUserId, friendUserId, userId],
    );

    if (relationRows.length > 0) {
      return res.status(409).json({ message: '既にフレンドです' });
    }

    await ensureFriendRequestsTable();

    const [pendingRows] = await db.promise().query(
      `SELECT * FROM friend_requests
       WHERE requester_user_id = ? AND receiver_user_id = ? AND status = 'PENDING'
       LIMIT 1`,
      [userId, friendUserId],
    );

    if (pendingRows.length > 0) {
      return res.status(409).json({ message: '既にフレンド申請済みです' });
    }

    const [incomingRows] = await db.promise().query(
      `SELECT * FROM friend_requests
       WHERE requester_user_id = ? AND receiver_user_id = ? AND status = 'PENDING'
       LIMIT 1`,
      [friendUserId, userId],
    );

    if (incomingRows.length > 0) {
      const incomingRequest = incomingRows[0];
      await db.promise().query(
        `INSERT IGNORE INTO friend_relations (user_id, friend_user_id)
         VALUES (?, ?), (?, ?)
        `,
        [userId, friendUserId, friendUserId, userId],
      );
      await db.promise().query('UPDATE friend_requests SET status = "ACCEPTED" WHERE request_id = ?', [incomingRequest.request_id]);
      await db.promise().query(
        'INSERT INTO notifications (user_id, actor_user_id, type, payload) VALUES (?, ?, ?, ?)',
        [friendUserId, userId, 'friend_request_accepted', JSON.stringify({ actor_name: (req.user && req.user.user_name) || null })],
      );
      return res.status(200).json({ friend: mapUser(req, targetRows[0]), accepted: true });
    }

    await ensureFriendRequestsTable();
    await db.promise().query(
      `INSERT INTO friend_requests (requester_user_id, receiver_user_id, status)
       VALUES (?, ?, 'PENDING')`,
      [userId, friendUserId],
    );

    try {
      const [actorRows] = await db.promise().query('SELECT user_name FROM users WHERE user_id = ?', [userId]);
      const actorName = actorRows && actorRows[0] ? actorRows[0].user_name : null;
      await db.promise().query(
        'INSERT INTO notifications (user_id, actor_user_id, type, payload) VALUES (?, ?, ?, ?)',
        [friendUserId, userId, 'friend_request', JSON.stringify({ actor_name: actorName })],
      );
    } catch (err) {
      console.error('通知作成失敗', err);
    }

    return res.status(200).json({ message: '申請を送信しました' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = {
  addFriend,
  getFriends,
  getRecommendations,
  searchUsers,
};

// GET /api/friends/search?q=...
async function searchUsers(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });
    if (!q) return res.status(400).json({ message: 'q パラメータが必要です' });

    const friendIds = await getFriendIds(userId);

    const params = [userId, `%${q}%`, `%${q}%`];
    let sql = `
      SELECT user_id, user_name, email, icon_image
      FROM users
      WHERE user_id <> ? AND (user_name LIKE ? OR email LIKE ?)
    `;

    if (friendIds.length > 0) {
      sql += ` AND user_id NOT IN (${friendIds.map(() => '?').join(',')})`;
      params.push(...friendIds);
    }

    sql += ' ORDER BY user_name ASC LIMIT 50';

    const [rows] = await db.promise().query(sql, params);
    return res.status(200).json({ users: rows.map((row) => mapUser(req, row)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
}