package submission

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/common"
	"sort"
	"time"
)

type CreateSubmissionResponse struct {
	SubmissionID uint `json:"submission_id"`
}

type RetrieveSubmissionResponse struct {
	ID          uint      `json:"id"`
	ProblemID   uint      `json:"problem_id"`
	SubmittedAt time.Time `json:"submitted_at"`
	Status      string    `json:"status"`
	Cost        int64     `json:"cost"`
	Error       string    `json:"error"`
	FileURL     string    `json:"file_url"`
}

type RetrieveSubmissionSerializer struct {
	Submission   common.Submission
	PresignedURl string
}

func (s RetrieveSubmissionSerializer) Response() RetrieveSubmissionResponse {
	return RetrieveSubmissionResponse{
		ID:          s.Submission.ID,
		ProblemID:   s.Submission.ProblemID,
		SubmittedAt: s.Submission.CreatedAt,
		Status:      s.Submission.Status,
		Cost:        s.Submission.Score,
		Error:       s.Submission.Error,
		FileURL:     s.PresignedURl,
	}
}

type SingleSubmissionResponse struct {
	ID          uint      `json:"id"`
	ProblemID   uint      `json:"problem_id"`
	SubmittedAt time.Time `json:"submitted_at"`
	Status      string    `json:"status"`
	Score       int64     `json:"score"`
	Error       string    `json:"error"`
}

type GetSubmissionsResponse struct {
	Submissions []SingleSubmissionResponse `json:"submissions"`
}

type GetSubmissionsSerializer struct {
	Submissions []common.Submission
}

func (s GetSubmissionsSerializer) Response() GetSubmissionsResponse {
	resp := GetSubmissionsResponse{Submissions: make([]SingleSubmissionResponse, 0)}

	for _, sub := range s.Submissions {
		resp.Submissions = append(resp.Submissions, SingleSubmissionResponse{
			ID:          sub.ID,
			ProblemID:   sub.ProblemID,
			SubmittedAt: sub.CreatedAt,
			Status:      sub.Status,
			Score:       sub.Score,
			Error:       sub.Error,
		})
	}

	sort.Slice(resp.Submissions, func(i, j int) bool {
		return resp.Submissions[i].ID > resp.Submissions[j].ID
	})

	return resp
}

type UploadSourceCodeResponse struct {
	MD5 string `json:"md5"`
}

type UploadSourceCodeSerializer struct {
	MD5 string
}

func (s UploadSourceCodeSerializer) Response() UploadSourceCodeResponse {
	return UploadSourceCodeResponse{
		MD5: s.MD5,
	}
}
