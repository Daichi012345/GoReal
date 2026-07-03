const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const submissionUploadDir = path.join(__dirname, "..", "..", "uploads", "mission_submissions");
fs.mkdirSync(submissionUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, submissionUploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `submission-${uniqueSuffix}${ext}`);
  },
});

const uploadSubmissionPhoto = multer({ storage });

const buildPhotoPath = (file) => (file ? `/uploads/mission_submissions/${file.filename}` : null);

const createMissionSubmission = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: "ユーザー未認証" });

    const { mission_id, comment } = req.body;
    const missionId = Number(mission_id);
    const photoPath = buildPhotoPath(req.file);

    if (!missionId || !photoPath) {
      return res.status(400).json({ message: "mission_id と画像が必要です" });
    }

    const [missionRows] = await db.promise().query("SELECT mission_id FROM missions WHERE mission_id = ?", [missionId]);
    if (missionRows.length === 0) {
      return res.status(404).json({ message: "ミッションが見つかりません" });
    }

    const [existingRows] = await db.promise().query(
      "SELECT submission_id FROM mission_submissions WHERE mission_id = ? AND user_id = ?",
      [missionId, userId],
    );

    let submissionId;
    if (existingRows.length > 0) {
      submissionId = existingRows[0].submission_id;
      await db.promise().query(
        "UPDATE mission_submissions SET photo_path = ?, comment = ?, status = 'PENDING', submitted_at = CURRENT_TIMESTAMP WHERE submission_id = ?",
        [photoPath, comment || null, submissionId],
      );
    } else {
      const [result] = await db.promise().query(
        "INSERT INTO mission_submissions (mission_id, user_id, photo_path, comment, status) VALUES (?, ?, ?, ?, 'PENDING')",
        [missionId, userId, photoPath, comment || null],
      );
      submissionId = result.insertId;
    }

    const [postRows] = await db.promise().query(
      "SELECT post_id FROM posts WHERE submission_id = ?",
      [submissionId],
    );

    if (postRows.length > 0) {
      await db.promise().query(
        "UPDATE posts SET caption = ?, user_id = ? WHERE submission_id = ?",
        [comment || null, userId, submissionId],
      );
    } else {
      await db.promise().query(
        "INSERT INTO posts (submission_id, user_id, caption) VALUES (?, ?, ?)",
        [submissionId, userId, comment || null],
      );
    }

    return res.status(201).json({
      submission_id: submissionId,
      mission_id: missionId,
      photo_url: `${req.protocol}://${req.get("host")}${photoPath}`,
      comment: comment || null,
      status: "PENDING",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "サーバーエラー" });
  }
};

module.exports = {
  uploadSubmissionPhoto,
  createMissionSubmission,
};
