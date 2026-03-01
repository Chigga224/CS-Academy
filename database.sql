
-- CS Academy Finalized Relational Schema

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (    
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
  `lockedRoleId` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: courses
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `teacher_id` VARCHAR(50),
  `teacher_name` VARCHAR(255),
  `category` VARCHAR(100),
  `duration` VARCHAR(50),
  `rating` FLOAT DEFAULT 5.0,
  `thumbnail` LONGTEXT,
  `video_url` LONGTEXT,
  `skills` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: notes
CREATE TABLE IF NOT EXISTS `notes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `courseId` VARCHAR(50),
  `courseTitle` VARCHAR(255),
  `teacherId` VARCHAR(50),
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `fileUrl` LONGTEXT,
  `fileName` VARCHAR(255),
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: student_progress
CREATE TABLE IF NOT EXISTS `student_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50),
  `course_id` VARCHAR(50),
  `last_timestamp` FLOAT DEFAULT 0,
  `is_completed` BOOLEAN DEFAULT FALSE,
  UNIQUE KEY `idx_student_course` (`student_id`, `course_id`),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: certificates
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50),
  `student_name` VARCHAR(255),
  `course_id` VARCHAR(50),
  `course_title` VARCHAR(255),
  `score` INT,
  `grade` VARCHAR(5),
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Seed (Optional)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('u1', 'John Student', 'student@cs.com', 'password', 'STUDENT'),
('u2', 'Prof. Ada', 'teacher@cs.com', 'password', 'TEACHER'),
('u3', 'System Admin', 'admin@cs.com', 'admin', 'ADMIN');

COMMIT;
