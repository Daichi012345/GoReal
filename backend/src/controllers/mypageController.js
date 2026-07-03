const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const avatarUploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(avatarUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, avatarUploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const uploadAvatar = multer({ storage });

const selectUserColumns = 'SELECT user_id, user_name, email, role, total_exp, level_id, icon_image FROM users WHERE user_id = ?';

const buildAvatarPath = (file) => (file ? `/uploads/avatars/${file.filename}` : null);
const formatUser = (req, user) => ({
  ...user,
  icon_image: user.icon_image ? `${req.protocol}://${req.get('host')}${user.icon_image}` : null,
});

const formatSubmission = (req, row) => ({
  submission_id: row.submission_id,
  mission_id: row.mission_id,
  mission_title: row.mission_title,
  comment: row.comment,
  status: row.status,
  submitted_at: row.submitted_at,
  photo_url: row.photo_path ? `${req.protocol}://${req.get('host')}${row.photo_path}` : null,
});

// GET /api/mypage
const getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const [rows] = await db.promise().query(selectUserColumns, [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'ユーザーが見つかりません' });

    return res.status(200).json({ user: formatUser(req, rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const [rows] = await db.promise().query(
      `SELECT ms.submission_id, ms.mission_id, ms.comment, ms.photo_path, ms.submitted_at, ms.status, m.mission_title
       FROM mission_submissions ms
       LEFT JOIN missions m ON ms.mission_id = m.mission_id
       WHERE ms.user_id = ?
       ORDER BY ms.submitted_at DESC`,
      [userId],
    );

    return res.status(200).json({ history: rows.map((row) => formatSubmission(req, row)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

const getHistoryById = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const submissionId = Number(req.params.submissionId);
    if (!submissionId) return res.status(400).json({ message: 'submissionId が必要です' });

    const [rows] = await db.promise().query(
      `SELECT ms.submission_id, ms.mission_id, ms.comment, ms.photo_path, ms.submitted_at, ms.status, m.mission_title
       FROM mission_submissions ms
       LEFT JOIN missions m ON ms.mission_id = m.mission_id
       WHERE ms.submission_id = ? AND ms.user_id = ?`,
      [submissionId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '履歴が見つかりません' });
    }

    return res.status(200).json({ history: formatSubmission(req, rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

// PUT /api/mypage
const updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const { user_name } = req.body;
    if (!user_name) return res.status(400).json({ message: 'user_name が必要です' });

    await db.promise().query('UPDATE users SET user_name = ? WHERE user_id = ?', [user_name, userId]);

    const [rows] = await db.promise().query(selectUserColumns, [userId]);
    return res.status(200).json({ user: formatUser(req, rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

// PUT /api/mypage/avatar
const updateAvatar = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'ユーザー未認証' });

    const avatarPath = buildAvatarPath(req.file);
    if (!avatarPath) {
      return res.status(400).json({ message: '画像が必要です' });
    }

    await db.promise().query('UPDATE users SET icon_image = ? WHERE user_id = ?', [avatarPath, userId]);

    const [rows] = await db.promise().query(selectUserColumns, [userId]);
    return res.status(200).json({ user: formatUser(req, rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  uploadAvatar,
  getHistory,
  getHistoryById,
};