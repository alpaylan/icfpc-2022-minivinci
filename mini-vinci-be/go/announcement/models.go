package announcement

import "gorm.io/gorm"

type Announcement struct {
	gorm.Model
	Content string
}
