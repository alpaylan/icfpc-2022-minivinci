package submission

import "mime/multipart"

type CreateSubmissionParams struct {
	ProblemID uint                 `uri:"problem_id" binding:"required"`
	File      multipart.FileHeader `form:"file" binding:"required"`
}

type RetrieveSubmissionParams struct {
	ID uint `uri:"id" binding:"required"`
}

type UploadSourceCodeParams struct {
	File multipart.FileHeader `form:"file" binding:"required"`
}
