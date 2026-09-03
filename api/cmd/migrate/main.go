package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/alliraa/api/internal/config"
	"github.com/alliraa/api/internal/database"
)

// One-off migration runner: applies migrations/*.sql against the DB in MYSQL_DSN.
// Strips leading `CREATE DATABASE ...` / `USE ...` statements since the target
// database is already selected via the DSN (needed for hosted DBs like Aiven
// where the app can't create arbitrary databases).
func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.MySQLDSN)
	if err != nil {
		log.Fatalf("mysql: %v", err)
	}
	defer db.Close()

	files, err := filepath.Glob("migrations/*.sql")
	if err != nil {
		log.Fatalf("glob: %v", err)
	}
	for _, f := range files {
		log.Printf("applying %s", f)
		raw, err := os.ReadFile(f)
		if err != nil {
			log.Fatalf("read %s: %v", f, err)
		}
		if err := applyStatements(db, string(raw)); err != nil {
			log.Fatalf("apply %s: %v", f, err)
		}
	}
	log.Println("migrations complete")
}

func applyStatements(db *sql.DB, script string) error {
	stmts := strings.Split(script, ";")
	for _, raw := range stmts {
		stmt := strings.TrimSpace(raw)
		if stmt == "" {
			continue
		}
		upper := strings.ToUpper(stmt)
		if strings.HasPrefix(upper, "CREATE DATABASE") || strings.HasPrefix(upper, "USE ") {
			continue
		}
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}
	return nil
}
