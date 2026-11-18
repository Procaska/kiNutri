-- Execute no banco KiNutri existente. Não remove tabelas nem dados.
CREATE TABLE IF NOT EXISTS food_images (
    id INT NOT NULL AUTO_INCREMENT,
    food_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_food_images_path (image_path),
    KEY idx_food_images_food_id (food_id),
    CONSTRAINT fk_food_images_food FOREIGN KEY (food_id) REFERENCES foods(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
