package db

import (
	"github.com/glebarez/sqlite"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"gorm.io/gorm"
)

var internalDB *gorm.DB

func Initialize() error {
	// Pure-Go SQLite driver (no cgo) so the binary cross-compiles and runs in a
	// minimal container. The database lives in a single file (see DATABASE_PATH).
	db, err := gorm.Open(sqlite.Open(config.Get().Database.Path), &gorm.Config{})
	if err != nil {
		return err
	}

	internalDB = db

	return nil
}

// Migrate creates/updates tables for the given gorm models. It is called from
// main with concrete model values to avoid an import cycle (model packages
// import this db package).
func Migrate(models ...interface{}) error {
	return internalDB.AutoMigrate(models...)
}

func Get() *gorm.DB {
	return internalDB
}
