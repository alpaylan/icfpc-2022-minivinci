package async

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/hibiken/asynq"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/email"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/evaluation"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"log"
)

const (
	TypeEmailDelivery      = "email:deliver"
	TypeEvaluateSubmission = "submission:evaluate"
)

func NewEmailDeliveryTask(p email.EmailDeliveryPayload) error {
	if config.Get().Async.Eager {
		return email.SendEmail(p)
	}

	payload, err := json.Marshal(p)
	if err != nil {
		return err
	}
	task := asynq.NewTask(TypeEmailDelivery, payload)

	client := asynq.NewClient(asynq.RedisClientOpt{Addr: config.Get().Redis.Address})
	defer client.Close()

	_, err = client.Enqueue(task)
	if err != nil {
		log.Fatalf("could not enqueue task: %v", err)
		return err
	}

	return nil
}

func HandleEmailDeliveryTask(ctx context.Context, t *asynq.Task) error {
	var p email.EmailDeliveryPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	err := email.SendEmail(p)
	if err != nil {
		logging.Logger.WithField("location", "HandleEmailDeliveryTask").
			WithError(err).Errorf("could not send email")
	}

	return err
}

func NewSubmissionEvaluationTask(p evaluation.SubmissionEvaluationPayload) error {
	if config.Get().Async.Eager {
		return evaluation.EvaluateSubmission(p)
	}

	payload, err := json.Marshal(p)
	if err != nil {
		return err
	}
	task := asynq.NewTask(TypeEvaluateSubmission, payload)

	client := asynq.NewClient(asynq.RedisClientOpt{Addr: config.Get().Redis.Address})
	defer client.Close()

	_, err = client.Enqueue(task)
	if err != nil {
		log.Fatalf("could not enqueue task: %v", err)
		return err
	}

	return nil
}

func HandleSubmissionEvaluationTask(ctx context.Context, t *asynq.Task) error {
	var p evaluation.SubmissionEvaluationPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	err := evaluation.EvaluateSubmission(p)
	if err != nil {
		logging.Logger.WithField("location", "HandleSubmissionEvaluationTask").
			WithError(err).Errorf("could not evaluate submission")
	}

	return err
}
