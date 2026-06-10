package submission

import (
	"fmt"
	"github.com/google/uuid"
)

func GenerateS3FileKey(userID, problemID uint) string {
	return fmt.Sprintf("user%d_problem_%d_%s.isl", userID, problemID, uuid.New().String())
}
