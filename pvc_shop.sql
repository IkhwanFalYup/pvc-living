CREATE DATABASE IF NOT EXISTS pvc_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pvc_shop;

DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(50),
    image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE portfolios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO users (username, password) VALUES
('admin', MD5('admin123'));

INSERT INTO products (name, code, price, stock, category, image, description) VALUES
('Panel PVC Marmer Elegan','PVC-MR-001',185000,25,'Panel PVC','assets/images/default.svg','Panel PVC motif marmer dengan tampilan elegan untuk dinding interior.'),
('Panel PVC Wood Classic','PVC-WD-002',165000,18,'Panel PVC','assets/images/default.svg','Panel PVC motif kayu klasik untuk suasana hangat dan natural.'),
('Panel PVC Stone Grey','PVC-ST-003',195000,30,'Panel PVC','assets/images/default.svg','Panel PVC motif batu abu-abu dengan karakter modern dan minimalis.'),
('Panel PVC Modern White','PVC-MW-004',175000,22,'Panel PVC','assets/images/default.svg','Panel PVC putih bersih yang cocok untuk berbagai konsep interior.'),
('Plafon PVC Minimalis','PLF-MN-005',145000,15,'Plafon PVC','assets/images/default.svg','Plafon PVC minimalis, ringan, mudah dibersihkan, dan cocok untuk rumah maupun toko.'),
('Panel PVC Motif Kayu Jati','PVC-JT-006',210000,10,'Panel PVC','assets/images/default.svg','Panel PVC motif kayu jati dengan kesan premium untuk ruang utama.');

INSERT INTO portfolios (title, category, image) VALUES
('Ruang Tamu Minimalis','Residential','assets/images/default.svg'),
('Plafon Toko Modern','Commercial','assets/images/default.svg'),
('Interior Kantor Elegan','Office','assets/images/default.svg');
