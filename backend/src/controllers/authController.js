const db = require("../config/db");
const bcrypt = require("bcrypt");

// ====================
// 新規登録
// ====================
const register = async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    if (!user_name || !email || !password) {
      return res.status(400).json({
        message: "入力項目不足",
      });
    }

    // メール重複確認
    const [exist] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (exist.length > 0) {
      return res.status(409).json({
        message: "メールアドレスは既に登録されています",
      });
    }

    // パスワード暗号化
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      `
      INSERT INTO users
      (
        user_name,
        email,
        password,
        role,
        total_exp,
        level_id
      )
      VALUES
      (?, ?, ?, 'PARTICIPANT', 0, 1)
      `,
      [user_name, email, hashedPassword],
    );

    res.status(201).json({
      message: "登録成功",
      user_id: result.insertId,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

// ====================
// ログイン
// ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "入力項目不足",
      });
    }

    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "メールアドレスまたはパスワードが違います",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "メールアドレスまたはパスワードが違います",
      });
    }

    res.status(200).json({
      message: "ログイン成功",
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      total_exp: user.total_exp,
      level_id: user.level_id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

module.exports = {
  register,
  login,
};
