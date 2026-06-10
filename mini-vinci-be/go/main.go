package main

import (
	"flag"
	"fmt"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/announcement"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/async"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/common"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/problem"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/server"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/support"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/user"
)

const (
	ModeServer = "SERVER"
	ModeWorker = "WORKER"
)

func main() {
	var mode string
	flag.StringVar(&mode, "mode", ModeServer, fmt.Sprintf("%s or %s", ModeServer, ModeWorker))
	flag.Parse()

	if err := config.Initialize(); err != nil {
		fmt.Printf("error while initializing config: %v\n", err)
		return
	}

	if err := logging.Initialize(); err != nil {
		fmt.Printf("error while initializing logger: %v/n", err)
	}

	if err := db.Initialize(); err != nil {
		fmt.Printf("error while initializing database: %v\n", err)
		return
	}

	if err := db.Migrate(
		&user.User{},
		&problem.Problem{},
		&common.Submission{},
		&common.Result{},
		&support.SupportMessage{},
		&announcement.Announcement{},
	); err != nil {
		fmt.Printf("error while migrating database: %v\n", err)
		return
	}

	switch mode {
	case ModeServer:
		server.InitalizeServer()
	case ModeWorker:
		async.InitializeWorker()
	default:
		fmt.Printf("invalid mode:%s/n", mode)
	}
}
