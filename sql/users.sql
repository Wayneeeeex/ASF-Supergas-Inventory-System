-- Run after schema.sql — adds login support.
-- (If using docker-entrypoint-initdb.d, name this 2-users.sql so it runs after 1-schema.sql)

USE asf_inventory;

CREATE TABLE IF NOT EXISTS users (
                                     id            INT AUTO_INCREMENT PRIMARY KEY,
                                     name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NULL DEFAULT '+63 917 555 0192',
    role          ENUM('admin','manager','staff','purchase_order') NOT NULL DEFAULT 'staff',
    station_id    INT NULL,             -- NULL = access to all stations (e.g. an owner/admin)
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_station FOREIGN KEY (station_id) REFERENCES stations(id)
    );

-- No seed row here on purpose — passwords need to be hashed by bcrypt, not
-- written as plaintext SQL. Run `npm run seed:admin` in backend/ after this,
-- see README for details.