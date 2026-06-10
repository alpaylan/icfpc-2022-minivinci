package async

import (
	"github.com/hibiken/asynq"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"log"
)

func InitializeWorker() {
	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: config.Get().Redis.Address},
		asynq.Config{
			Concurrency: 3,
		},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc(TypeEmailDelivery, HandleEmailDeliveryTask)
	mux.HandleFunc(TypeEvaluateSubmission, HandleSubmissionEvaluationTask)

	if err := srv.Run(mux); err != nil {
		log.Fatalf("could not run server: %v", err)
	}
}
