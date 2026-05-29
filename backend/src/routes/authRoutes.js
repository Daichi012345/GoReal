const express = require("express");

const bcrypt = require("bcrypt");

const db = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // メール確認
    const checkSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "DBエラー",
        });
      }

      // 既に存在
      if (result.length > 0) {
        return res.status(400).json({
          message: "既に登録されています",
        });
      }

      // パスワード暗号化
      const hashedPassword = await bcrypt.hash(password, 10);

      // users追加
      const insertSql = `
          INSERT INTO users
          (
            user_name,
            email,
            password,
            role,
            total_exp,
            level_id
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;

      db.query(
        insertSql,
        ["名無し", email, hashedPassword, "PARTICIPANT", 0, 1],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "登録失敗",
            });
          }

          return res.json({
            message: "登録成功",
          });
        },
      );
    });
  } catch (error) {
    return res.status(500).json({
      message: "サーバーエラー",
    });
  }
});

module.exports = router;
