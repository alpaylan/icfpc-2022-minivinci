package user

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"gorm.io/gorm"
)

type UserStore struct {
	db *gorm.DB
}

func NewUserStore() UserStore {
	return UserStore{db: db.Get()}
}

func (s *UserStore) Create(usr User) (User, error) {
	err := s.db.Create(&usr).Error
	if err != nil {
		return User{}, err
	}

	return usr, nil
}

func (s *UserStore) Find() ([]User, error) {
	var users []User

	err := s.db.Find(&users).Error
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (s *UserStore) First(cond map[string]interface{}) (User, error) {
	var usr User

	err := s.db.Where(cond).First(&usr).Error
	if err != nil {
		return User{}, err
	}

	return usr, nil
}

func (s *UserStore) Count(cond map[string]interface{}) (uint, error) {
	var cnt int64

	err := s.db.Model(&User{}).Where(cond).Count(&cnt).Error
	if err != nil {
		return 0, err
	}

	return uint(cnt), nil
}

func (s *UserStore) Update(userID uint, fields map[string]interface{}) error {
	err := s.db.Model(&User{}).Where("id = ?", userID).Updates(fields).Error
	return err
}
