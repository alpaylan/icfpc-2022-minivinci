package common

import (
	"database/sql"
	"gorm.io/gorm"
)

type Result struct {
	gorm.Model
	UserID          uint
	ProblemID       uint
	LastSubmittedAt sql.NullTime
	SubmissionCount uint
	MaxScore        int64
}

type ProblemBestCost struct {
	Problem uint
	Cost    int64
}
