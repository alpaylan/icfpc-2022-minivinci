package common

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
)

type SubmissionStore struct {
	db *gorm.DB
}

func NewSubmissionStore() SubmissionStore {
	return SubmissionStore{db: db.Get()}
}

func (s *SubmissionStore) Create(sub Submission) (Submission, error) {
	err := s.db.Create(&sub).Error
	if err != nil {
		return Submission{}, err
	}

	return sub, nil
}

func (s *SubmissionStore) First(cond map[string]interface{}) (Submission, error) {
	var sub Submission

	err := s.db.Where(cond).First(&sub).Error
	if err != nil {
		return Submission{}, err
	}

	return sub, nil
}

func (s *SubmissionStore) Find(cond map[string]interface{}) ([]Submission, error) {
	var subs []Submission

	err := s.db.Where(cond).Find(&subs).Error
	if err != nil {
		return nil, err
	}

	return subs, nil
}

func (s *SubmissionStore) Update(submissionID uint, fields map[string]interface{}) error {
	err := s.db.Model(&Submission{}).Where("id = ?", submissionID).Updates(fields).Error
	return err
}
