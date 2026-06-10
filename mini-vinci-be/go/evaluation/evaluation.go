package evaluation

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/google/uuid"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/common"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/storage"
	"github.com/sirupsen/logrus"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"
)

const (
	EvaluationTimeOutInSeconds = 10

	EvaluationErrSystem  = "system error"
	EvaluationErrTimeout = "timeout"

	EvaluationResultTypeSucceed = "succeed"
	EvaluationResultTypeFailed  = "failed"
)

type SubmissionEvaluationPayload struct {
	SubmissionID uint
}

type JudgeResult struct {
	Result string `json:"result"`
	Err    string `json:"err"`
	Cost   int64  `json:"cost"`
}

type EvaluationResult struct {
	Result string
	Score  int64
	Error  string
}

func Evaluate(sub common.Submission) EvaluationResult {
	log := logging.Logger.WithFields(logrus.Fields{
		"location":      "Evaluate",
		"submission_id": sub.ID,
	})

	judgeDir := config.Get().Judge.Dir
	subFileName := fmt.Sprintf("%s.isl", uuid.New().String())
	subDir := path.Join(judgeDir, "submissions")
	subFilePath := path.Join(subDir, subFileName)

	if err := os.MkdirAll(subDir, 0o755); err != nil {
		log.WithError(err).Errorf("could not create submissions directory")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}

	subFile, err := os.Create(subFilePath)
	if err != nil {
		log.WithError(err).Errorf("could not create submission file")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}
	defer func() {
		subFile.Close()
		if err := os.Remove(subFilePath); err != nil {
			log.WithError(err).Errorf("could not delete submission file")
		}
	}()

	sess, err := storage.Session()
	if err != nil {
		log.WithError(err).Errorf("could not create new aws session")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}

	downloader := s3manager.NewDownloader(sess)
	numBytes, err := downloader.Download(subFile,
		&s3.GetObjectInput{
			Bucket: aws.String(config.Get().S3.SubmissionsBucketName),
			Key:    aws.String(sub.S3Key),
		})
	if err != nil {
		log.WithError(err).Errorf("could not download submission")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}

	fmt.Println("Downloaded", subFile.Name(), numBytes, "bytes")

	ctx := context.Background()
	var cancel context.CancelFunc
	ctx, cancel = context.WithTimeout(context.Background(), EvaluationTimeOutInSeconds*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "node", "dist/ISLRunner.js",
		fmt.Sprintf("submissions/%s", subFileName),
		fmt.Sprintf("%d", sub.ProblemID))

	cmd.Dir = judgeDir

	output, err := cmd.Output()
	if err != nil {
		log.WithError(err).Errorf("could not run the command")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}

	if ctx.Err() == context.DeadlineExceeded {
		log.WithError(ctx.Err()).Errorf("timeout happened")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrTimeout}
	}

	outputAsStr := strings.TrimSpace(string(output))

	log.Infof("judge result: %s", outputAsStr)

	var judgeResult JudgeResult

	if err := json.Unmarshal([]byte(outputAsStr), &judgeResult); err != nil {
		log.WithError(err).Errorf("could not unmarshall judge result")
		return EvaluationResult{Result: EvaluationResultTypeFailed, Error: EvaluationErrSystem}
	}

	fmt.Println(judgeResult)

	res := EvaluationResultTypeSucceed
	if judgeResult.Result != "success" {
		res = EvaluationResultTypeFailed
	}

	return EvaluationResult{
		Result: res,
		Score:  judgeResult.Cost,
		Error:  judgeResult.Err,
	}
}

func EvaluateSubmission(payload SubmissionEvaluationPayload) error {
	submissionStore := common.NewSubmissionStore()

	submission, err := submissionStore.First(map[string]interface{}{
		"id": payload.SubmissionID,
	})
	if err != nil {
		return fmt.Errorf("error while getting submission: %v", err)
	}

	err = submissionStore.Update(payload.SubmissionID, map[string]interface{}{
		"status":            common.SubmissionStatusProcessing,
		"status_changed_at": time.Now(),
	})

	result := Evaluate(submission)

	if result.Result != EvaluationResultTypeFailed && result.Result != EvaluationResultTypeSucceed {
		return fmt.Errorf("unknown evaluation result type")
	}

	// if evaluation is failed
	if result.Result == EvaluationResultTypeFailed {
		err = submissionStore.Update(payload.SubmissionID, map[string]interface{}{
			"status":            common.SubmissionStatusFailed,
			"status_changed_at": time.Now(),
			"error":             result.Error,
		})
		if err != nil {
			return fmt.Errorf("error while updating submission as failed: %v", err)
		}

		return nil
	}

	// evaluation is succeeded

	err = submissionStore.Update(payload.SubmissionID, map[string]interface{}{
		"status":            common.SubmissionStatusSucceeded,
		"status_changed_at": time.Now(),
		"score":             result.Score,
	})
	if err != nil {
		return fmt.Errorf("error while updating submission as succeeeded: %v", err)
	}

	resultStore := common.NewResultStore()

	err = resultStore.CreateIfRequired(submission.UserID, submission.ProblemID)
	if err != nil {
		return fmt.Errorf("error while creating result record if required: %v", err)
	}

	err = resultStore.UpdateResult(submission.UserID, submission.ProblemID, submission.CreatedAt, result.Score)
	if err != nil {
		return fmt.Errorf("error while updating result: %v", err)
	}

	return nil
}
