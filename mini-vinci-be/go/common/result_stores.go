package common

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
	"time"
)

type ResultStore struct {
	db *gorm.DB
}

func NewResultStore() ResultStore {
	return ResultStore{db: db.Get()}
}

func (s *ResultStore) Find(cond map[string]interface{}) ([]Result, error) {
	var results []Result

	err := s.db.Where(cond).Find(&results).Error
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (s *ResultStore) CreateIfRequired(userID, problemID uint) error {
	err := s.db.FirstOrCreate(&Result{}, Result{UserID: userID, ProblemID: problemID}).Error
	return err
}

func (s *ResultStore) UpdateResult(userID, problemID uint, time time.Time, score int64) error {
	// MAX/MIN are SQLite's multi-argument scalar functions (equivalent to
	// Postgres GREATEST/LEAST). Unlike GREATEST, SQLite's MAX returns NULL if any
	// argument is NULL, so the existing (initially NULL) timestamp is coalesced.
	err := s.db.Exec(`
			UPDATE results
			SET submission_count = submission_count + 1,
				last_submitted_at = MAX(IFNULL(last_submitted_at, ?), ?),
					max_score = CASE
						WHEN submission_count = 0 THEN ?
						ELSE MIN(max_score, ?)
					END
			WHERE user_id = ? and problem_id = ?`,
		time, time, score, score, userID, problemID).Error

	return err
}

func (s *ResultStore) DeleteAll() error {
	err := s.db.Exec(`DELETE FROM results WHERE true`).Error

	return err
}

func (s *ResultStore) GetProblemBestCosts() ([]ProblemBestCost, error) {
	var results []ProblemBestCost
	err := s.db.Raw("SELECT problem_id as problem, min(max_score) as cost FROM results GROUP BY problem_id").
		Scan(&results).Error

	return results, err
}
