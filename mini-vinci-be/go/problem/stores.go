package problem

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
)

type ProblemStore struct {
	db *gorm.DB
}

func NewProblemStore() ProblemStore {
	return ProblemStore{db: db.Get()}
}

func (s *ProblemStore) Find() ([]Problem, error) {
	var problems []Problem

	err := s.db.Find(&problems).Error
	if err != nil {
		return nil, err
	}

	return problems, nil
}
