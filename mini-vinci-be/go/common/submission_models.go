package common

import (
	"gorm.io/gorm"
	"time"
)

const (
	SubmissionStatusQueued     = "QUEUED"
	SubmissionStatusProcessing = "PROCESSING"
	SubmissionStatusSucceeded  = "SUCCEEDED"
	SubmissionStatusFailed     = "FAILED"
)

type Submission struct {
	gorm.Model
	StatusChangedAt time.Time
	ProblemID       uint
	S3Key           string
	UserID          uint
	Status          string
	Error           string
	Score           int64
}
