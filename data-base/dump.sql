  CREATE DATABASE IF NOT EXISTS `kinutri_db`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

  USE `kinutri_db`;

  SET FOREIGN_KEY_CHECKS = 0;

  DROP TABLE IF EXISTS `diet_foods`;
  DROP TABLE IF EXISTS `diets`;
  DROP TABLE IF EXISTS `foods`;
  DROP TABLE IF EXISTS `food_categories`;
  DROP TABLE IF EXISTS `user_profiles`;
  DROP TABLE IF EXISTS `users`;
  DROP TABLE IF EXISTS `user_types`;

  SET FOREIGN_KEY_CHECKS = 1;

  -- ============================================
  -- TABELA: user_types
  -- ============================================

  CREATE TABLE `user_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `user_types` (`id`, `name`) VALUES
  (1, 'ADMIN'),
  (2, 'STANDARD');

  -- ============================================
  -- TABELA: users
  -- ============================================

  CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `typeId` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `photo` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_users_user_types_idx` (`typeId`),
    CONSTRAINT `fk_users_user_types`
      FOREIGN KEY (`typeId`)
      REFERENCES `user_types` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `users` (`id`, `typeId`, `name`, `email`, `password`, `photo`) VALUES
  (1, 1, 'Administrador KiNutri', 'admin@kinutri.com', '12345678', NULL),
  (2, 2, 'Usuário Teste', 'usuario@kinutri.com', '12345678', NULL);

  -- ============================================
  -- TABELA: user_profiles
  -- ============================================

  CREATE TABLE `user_profiles` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `birth_date` date DEFAULT NULL,
    `gender` varchar(20) DEFAULT NULL,
    `weight` decimal(10,2) DEFAULT NULL,
    `height` decimal(10,2) DEFAULT NULL,
    `activity_level` varchar(100) DEFAULT NULL,
    `goal` varchar(255) DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id_unique` (`user_id`),

    CONSTRAINT `fk_user_profiles_users`
      FOREIGN KEY (`user_id`)
      REFERENCES `users` (`id`)
      ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  INSERT INTO `user_profiles`
  (`id`, `user_id`, `birth_date`, `gender`, `weight`, `height`, `activity_level`, `goal`) VALUES
  (1, 2, '2006-01-01', 'masculino', 70.00, 175.00, 'moderado', 'Emagrecimento');

  -- ============================================
  -- TABELA: food_categories
  -- ============================================

  CREATE TABLE `food_categories` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `food_categories` (`id`, `name`) VALUES
  (1, 'Proteínas'),
  (2, 'Carboidratos'),
  (3, 'Frutas'),
  (4, 'Verduras e Legumes'),
  (5, 'Gorduras Boas');

  -- ============================================
  -- TABELA: foods
  -- ============================================

  CREATE TABLE `foods` (
    `id` int NOT NULL AUTO_INCREMENT,
    `category_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `calories` decimal(10,2) NOT NULL,
    `protein` decimal(10,2) NOT NULL,
    `carbs` decimal(10,2) NOT NULL,
    `fat` decimal(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_foods_food_categories_idx` (`category_id`),
    CONSTRAINT `fk_foods_food_categories`
      FOREIGN KEY (`category_id`)
      REFERENCES `food_categories` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `foods` (`id`, `category_id`, `name`, `calories`, `protein`, `carbs`, `fat`) VALUES
  (1, 1, 'Frango Grelhado', 165.00, 31.00, 0.00, 3.60),
  (2, 1, 'Ovo Cozido', 78.00, 6.00, 0.60, 5.30),
  (3, 2, 'Arroz Branco', 130.00, 2.70, 28.00, 0.30),
  (4, 2, 'Batata Doce', 86.00, 1.60, 20.00, 0.10),
  (5, 3, 'Banana', 89.00, 1.10, 23.00, 0.30),
  (6, 3, 'Maçã', 52.00, 0.30, 14.00, 0.20),
  (7, 4, 'Brócolis', 55.00, 3.70, 11.00, 0.60),
  (8, 5, 'Abacate', 160.00, 2.00, 9.00, 15.00);

  -- ============================================
  -- TABELA: diets
  -- ============================================

  CREATE TABLE `diets` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int DEFAULT NULL,
    `name` varchar(255) NOT NULL,
    `goal` varchar(255) NOT NULL,
    `calories` decimal(10,2) NOT NULL DEFAULT 0,
    `protein` decimal(10,2) NOT NULL DEFAULT 0,
    `carbs` decimal(10,2) NOT NULL DEFAULT 0,
    `fat` decimal(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `fk_diets_users_idx` (`user_id`),
    CONSTRAINT `fk_diets_users`
      FOREIGN KEY (`user_id`)
      REFERENCES `users` (`id`)
      ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `diets` (`id`, `user_id`, `name`, `goal`, `calories`, `protein`, `carbs`, `fat`) VALUES
  (1, 2, 'Dieta Emagrecimento', 'Emagrecimento', 0.00, 0.00, 0.00, 0.00),
  (2, 2, 'Dieta Ganho de Massa', 'Ganho de Massa', 0.00, 0.00, 0.00, 0.00);

  -- ============================================
  -- TABELA: diet_foods
  -- ============================================

  CREATE TABLE `diet_foods` (
    `id` int NOT NULL AUTO_INCREMENT,
    `diet_id` int NOT NULL,
    `food_id` int NOT NULL,
    `meal` varchar(100) NOT NULL,
    `quantity` decimal(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_diet_foods_diets_idx` (`diet_id`),
    KEY `fk_diet_foods_foods_idx` (`food_id`),
    CONSTRAINT `fk_diet_foods_diets`
      FOREIGN KEY (`diet_id`)
      REFERENCES `diets` (`id`)
      ON DELETE CASCADE,
    CONSTRAINT `fk_diet_foods_foods`
      FOREIGN KEY (`food_id`)
      REFERENCES `foods` (`id`)
      ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  INSERT INTO `diet_foods` (`id`, `diet_id`, `food_id`, `meal`, `quantity`) VALUES
  (1, 1, 1, 'Almoço', 150.00),
  (2, 1, 3, 'Almoço', 100.00),
  (3, 1, 5, 'Lanche', 1.00),
  (4, 2, 1, 'Almoço', 200.00),
  (5, 2, 4, 'Pré-Treino', 150.00);