package support

import (
	"sort"
	"time"
)

type SingleMessageResponse struct {
	Time     time.Time `json:"time"`
	Message  string    `json:"message"`
	IsAnswer bool      `json:"is_answer"`
}

type GetSupportMessagesResponse struct {
	History []SingleMessageResponse `json:"history"`
}

type GetSupportMessagesSerializer struct {
	SupportMessages []SupportMessage
}

func (s GetSupportMessagesSerializer) Response() GetSupportMessagesResponse {
	resp := GetSupportMessagesResponse{History: make([]SingleMessageResponse, 0)}

	for _, m := range s.SupportMessages {
		resp.History = append(resp.History, SingleMessageResponse{
			Time:     m.CreatedAt,
			Message:  m.Content,
			IsAnswer: m.IsAnswer,
		})
	}

	// sort such that the oldest will be the first
	sort.Slice(resp.History, func(i, j int) bool {
		return resp.History[i].Time.Before(resp.History[j].Time)
	})

	return resp
}
