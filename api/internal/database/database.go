package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/alliraa/api/internal/config"
	"github.com/alliraa/api/internal/models"
	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func Connect(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	var lastErr error
	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			return db, nil
		} else {
			lastErr = err
			time.Sleep(time.Second)
		}
	}
	return nil, fmt.Errorf("mysql ping failed: %w", lastErr)
}

func EnsureAdmin(db *sql.DB, cfg config.Config) error {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM admins`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = db.Exec(`INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)`,
		cfg.AdminEmail, string(hash), "Admin")
	return err
}

func EnsureBranding(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS store_branding (
			id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
			data_json JSON NOT NULL,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB`)
	if err != nil {
		return err
	}
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM store_branding WHERE id = 1`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	raw, err := json.Marshal(models.DefaultBranding())
	if err != nil {
		return err
	}
	_, err = db.Exec(`INSERT INTO store_branding (id, data_json) VALUES (1, ?)`, string(raw))
	return err
}

// EnsureCategoryFabricsColumn adds fabrics_json to categories if missing (idempotent).
func EnsureCategoryFabricsColumn(db *sql.DB) error {
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE()
		  AND TABLE_NAME = 'categories'
		  AND COLUMN_NAME = 'fabrics_json'`).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err = db.Exec(`ALTER TABLE categories ADD COLUMN fabrics_json JSON NULL AFTER description`)
	return err
}

// EnsureCategoryPrintsColumn adds prints_json to categories if missing (idempotent).
func EnsureCategoryPrintsColumn(db *sql.DB) error {
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE()
		  AND TABLE_NAME = 'categories'
		  AND COLUMN_NAME = 'prints_json'`).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err = db.Exec(`ALTER TABLE categories ADD COLUMN prints_json JSON NULL AFTER fabrics_json`)
	return err
}
