const db = require('../config/db');

const toAbsoluteAvatar = (req, iconImage) => {
  if (!iconImage) return null;
  if (iconImage.startsWith('http://') || iconImage.startsWith('https://')) return iconImage;
  return `${req.protocol}://${req.get('host')}${iconImage}`;
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

    await db.promise().query(
      `
      INSERT IGNORE INTO friend_relations (user_id, friend_user_id)
      VALUES (?, ?), (?, ?)
      `,
      [userId, friendUserId, friendUserId, userId],
    );

    return res.status(200).json({ friend: mapUser(req, targetRows[0]) });
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