-- ==========================================
-- GoReal DB 初期化SQL
-- ==========================================

CREATE DATABASE IF NOT EXISTS goreal_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE goreal_db;

-- ==========================================
-- levels
-- ==========================================

CREATE TABLE levels (

    level_id INT
    AUTO_INCREMENT PRIMARY KEY,

    required_exp INT
    NOT NULL UNIQUE,

    title VARCHAR(100)
    NOT NULL

);

INSERT INTO levels
(required_exp, title)
VALUES
(0, 'Lv1'),
(100, 'Lv2'),
(300, 'Lv3'),
(600, 'Lv4'),
(1000, 'Lv5');

-- ==========================================
-- users
-- ==========================================

CREATE TABLE users (

    user_id INT
    AUTO_INCREMENT PRIMARY KEY,

    user_name VARCHAR(50)
    NOT NULL,

    email VARCHAR(100)
    NOT NULL UNIQUE,

    password VARCHAR(255)
    NOT NULL,

    icon_image VARCHAR(255),

    role ENUM(
        'HOST',
        'PARTICIPANT'
    ) NOT NULL,

    total_exp INT
    NOT NULL DEFAULT 0,

    level_id INT
    NOT NULL,

    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_level
    FOREIGN KEY (level_id)
    REFERENCES levels(level_id)

);

-- ==========================================
-- friend_relations
-- ==========================================

CREATE TABLE friend_relations (

    relation_id INT
    AUTO_INCREMENT PRIMARY KEY,

    user_id INT
    NOT NULL,

    friend_user_id INT
    NOT NULL,

    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_friend_relation_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

    CONSTRAINT fk_friend_relation_friend
    FOREIGN KEY (friend_user_id)
    REFERENCES users(user_id),

    UNIQUE (
        user_id,
        friend_user_id
    )

);

-- ==========================================
-- community_groups
-- ==========================================

CREATE TABLE community_groups (

    group_id INT
    AUTO_INCREMENT PRIMARY KEY,

    group_name VARCHAR(100)
    NOT NULL,

    group_code VARCHAR(10)
    NOT NULL UNIQUE,

    created_by INT
    NOT NULL,

    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_group_creator
    FOREIGN KEY (created_by)
    REFERENCES users(user_id)

);

-- ==========================================
-- group_members
-- ==========================================

CREATE TABLE group_members (

    member_id INT
    AUTO_INCREMENT PRIMARY KEY,

    group_id INT
    NOT NULL,

    user_id INT
    NOT NULL,

    joined_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_member_group
    FOREIGN KEY (group_id)
    REFERENCES community_groups(group_id),

    CONSTRAINT fk_member_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

    UNIQUE (
        group_id,
        user_id
    )

);

-- ==========================================
-- events
-- ==========================================

CREATE TABLE events (

    event_id INT AUTO_INCREMENT PRIMARY KEY,

    group_id INT NOT NULL,

    event_name VARCHAR(100) NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_group
    FOREIGN KEY (group_id)
    REFERENCES community_groups(group_id)

);

-- ==========================================
-- missions
-- ==========================================

CREATE TABLE missions (

    mission_id INT
    AUTO_INCREMENT PRIMARY KEY,

    event_id INT
    NOT NULL,

    mission_title VARCHAR(100)
    NOT NULL,

    mission_detail TEXT
    NOT NULL,

    reward_exp INT
    DEFAULT 100,

    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mission_event
    FOREIGN KEY (event_id)
    REFERENCES events(event_id)

);

-- ==========================================
-- mission_submissions
-- ==========================================

CREATE TABLE mission_submissions (

    submission_id INT
    AUTO_INCREMENT PRIMARY KEY,

    mission_id INT
    NOT NULL,

    user_id INT
    NOT NULL,

    photo_path VARCHAR(255),

    comment TEXT,

    submitted_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED'
    ) NOT NULL,

    CONSTRAINT fk_submission_mission
    FOREIGN KEY (mission_id)
    REFERENCES missions(mission_id),

    CONSTRAINT fk_submission_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

    UNIQUE (
        user_id,
        mission_id
    )

);

-- ==========================================
-- posts
-- ==========================================

CREATE TABLE posts (

    post_id INT
    AUTO_INCREMENT PRIMARY KEY,

    submission_id INT
    NOT NULL UNIQUE,

    user_id INT
    NOT NULL,

    caption TEXT,

    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_submission
    FOREIGN KEY (submission_id)
    REFERENCES mission_submissions(
        submission_id
    ),

    CONSTRAINT fk_post_user
    FOREIGN KEY (user_id)
    REFERENCES users(
        user_id
    )

);


-- ==========================================
-- TEST USERS
-- ==========================================

INSERT INTO users
(
    user_name,
    email,
    password,
    role,
    total_exp,
    level_id
)

-- ==========================================
-- TEST GROUP
-- ==========================================

INSERT INTO community_groups
(
    group_name,
    group_code,
    created_by
)
VALUES
(
    '3-1クラス',
    'ABC123',
    1
);

-- ==========================================
-- TEST MEMBERS
-- ==========================================

INSERT INTO group_members
(
    group_id,
    user_id
)
VALUES
(1,1),
(1,2),
(1,3);

-- ==========================================
-- TEST EVENTS
-- ==========================================

INSERT INTO events
(
    group_id,
    event_name
)
VALUES
(
    1,
    '文化祭2026'
),
(
    1,
    '体育祭2026'
);

-- ==========================================
-- TEST MISSIONS
-- ==========================================

INSERT INTO missions
(
    event_id,
    mission_title,
    mission_detail,
    reward_exp
)
VALUES
(
    1,
    '体育館の写真を撮ろう',
    '文化祭会場である体育館の写真を投稿してください',
    100
),
(
    1,
    '模擬店の写真を撮ろう',
    '好きな模擬店の写真を投稿してください',
    150
),
(
    1,
    'クラスTシャツを投稿しよう',
    'クラスTシャツが写るように撮影してください',
    200
),
(
    2,
    '玉入れの写真を撮ろう',
    '競技中の玉入れの様子を撮影してください',
    100
),
(
    2,
    'リレーの写真を撮ろう',
    'リレー競技中の写真を投稿してください',
    150
),
(
    2,
    '応援団の写真を撮ろう',
    '応援団の様子を撮影してください',
    200
);

-- ==========================================
-- TEST SUBMISSION
-- ==========================================

INSERT INTO mission_submissions
(
    mission_id,
    user_id,
    photo_path,
    comment,
    status
)
VALUES
(
    1,
    2,
    '/uploads/gym.jpg',
    '体育館の写真を撮りました',
    'APPROVED'
);

-- ==========================================
-- TEST POST
-- ==========================================

INSERT INTO posts
(
    submission_id,
    user_id,
    caption
)
VALUES
(
    1,
    2,
    '文化祭楽しみました！'
);