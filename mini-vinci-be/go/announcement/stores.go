package announcement

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
)

type AnnouncementStore struct {
	db *gorm.DB
}

func NewAnnouncementStore() AnnouncementStore {
	return AnnouncementStore{db: db.Get()}
}

func (s *AnnouncementStore) Find() ([]Announcement, error) {
	var announcements []Announcement

	err := s.db.Find(&announcements).Error
	if err != nil {
		return nil, err
	}

	return announcements, nil
}
