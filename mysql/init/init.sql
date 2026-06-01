```sql
-- ==========================================
-- GoReal DB 初期化SQL
-- ==========================================

CREATE DATABASE IF NOT EXISTS goreal_db;

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

    event_id INT
    AUTO_INCREMENT PRIMARY KEY,

    group_id INT
    NOT NULL,

    event_name VARCHAR(100)
    NOT NULL,

    category VARCHAR(50)
    NOT NULL,

    start_date DATETIME
    NOT NULL,

    end_date DATETIME
    NOT NULL,

    status ENUM(
        'WAITING',
        'RUNNING',
        'END'
    ) NOT NULL,

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
```
