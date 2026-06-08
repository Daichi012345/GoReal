const db = require("../config/db");
const bcrypt = require("bcrypt");

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

    await db.promise().query(
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
};
