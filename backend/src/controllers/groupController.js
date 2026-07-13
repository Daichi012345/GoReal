const db = require("../config/db");

// コミュニティグループ作成
const createGroup = async (req, res) => {
  console.log("createGroup呼ばれた");
  console.log(req.body);
  try {
    const { group_name, created_by } = req.body;

    if (!group_name || !created_by) {
      return res.status(400).json({
        message: "入力項目不足",
      });
    }

    // ==========================
    // 同じ施設名のグループがあるか確認
    // ==========================
    const [existGroups] = await db.promise().query(
      `
      SELECT
        group_id,
        group_code
      FROM community_groups
      WHERE group_name = ?
      LIMIT 1
      `,
      [group_name],
    );

    // 既に存在する場合は新規作成しない
    if (existGroups.length > 0) {
      return res.status(200).json({
        message: "既存グループ",
        group_id: existGroups[0].group_id,
        group_code: existGroups[0].group_code,
      });
    }

    // ==========================
    // 新規グループ作成
    // ==========================
    const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const [result] = await db.promise().query(
      `
      INSERT INTO community_groups
      (
        group_name,
        group_code,
        created_by
      )
      VALUES
      (?, ?, ?)
      `,
      [group_name, groupCode, created_by],
    );

    res.status(201).json({
      message: "グループ作成成功",
      group_id: result.insertId,
      group_code: groupCode,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

const getGroupByName = async (req, res) => {
  try {
    const { group_name } = req.query;

    const [groups] = await db.promise().query(
      `
      SELECT *
      FROM community_groups
      WHERE group_name = ?
      LIMIT 1
      `,
      [group_name],
    );

    if (groups.length === 0) {
      return res.status(404).json({
        message: "グループなし",
      });
    }

    return res.status(200).json(groups[0]);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

// グループ一覧取得
const getGroups = async (req, res) => {
  try {
    const [groups] = await db.promise().query(
      `
      SELECT
        group_id,
        group_name,
        group_code,
        created_by,
        created_at
      FROM community_groups
      ORDER BY group_id DESC
      `,
    );

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "サーバーエラー",
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupByName,
};
