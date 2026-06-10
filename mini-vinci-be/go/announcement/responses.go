package announcement

import (
	"sort"
	"time"
)

type SingleAnnouncementResponse struct {
	Time    time.Time `json:"time"`
	Content string    `json:"content"`
}

type GetAnnouncementsResponse struct {
	Announcements []SingleAnnouncementResponse `json:"announcements"`
}

type GetAnnouncementsSerializer struct {
	Announcements []Announcement
}

func (s GetAnnouncementsSerializer) Response() GetAnnouncementsResponse {
	resp := GetAnnouncementsResponse{Announcements: make([]SingleAnnouncementResponse, 0)}

	for _, a := range s.Announcements {
		resp.Announcements = append(resp.Announcements, SingleAnnouncementResponse{
			Time:    a.CreatedAt,
			Content: a.Content,
		})
	}

	// sort such that the oldest will be the first
	sort.Slice(resp.Announcements, func(i, j int) bool {
		return resp.Announcements[i].Time.Before(resp.Announcements[j].Time)
	})

	return resp
}
