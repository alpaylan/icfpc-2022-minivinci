package support

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
)

type SupportMessageStore struct {
	db *gorm.DB
}

func NewSupportMessageStore() SupportMessageStore {
	return SupportMessageStore{db: db.Get()}
}

func (s *SupportMessageStore) Find(cond map[string]interface{}) ([]SupportMessage, error) {
	var supportMessages []SupportMessage

	err := s.db.Where(cond).Find(&supportMessages).Error
	if err != nil {
		return nil, err
	}

	return supportMessages, nil
}

func (s *SupportMessageStore) Create(supportMessage SupportMessage) (SupportMessage, error) {
	err := s.db.Create(&supportMessage).Error
	if err != nil {
		return SupportMessage{}, err
	}

	return supportMessage, nil
}
