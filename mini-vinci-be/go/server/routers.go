package server

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/announcement"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/problem"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/result"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/submission"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/support"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/user"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

const (
	ReactBuildPath = "../../mini-vinci-fe/build"
)

func CORS() gin.HandlerFunc {
	// TO allow CORS
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func setUpRouters(r *gin.Engine) error {
	r.Use(CORS())

	// r.Use(static.Serve("/", static.LocalFile(ReactBuildPath, false)))

	// Unauthenticated health check (used by the platform health checks).
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// set general rate limiter
	r.Use(mgin.NewMiddleware(
		limiter.New(memory.NewStore(),
			limiter.Rate{
				Period: 3 * time.Minute,
				Limit:  250,
			}),
	))

	apiGroup := r.Group("/api")

	//user
	userRouter := user.UserRouter{}

	authMiddleware, err := user.GetAuthMiddleware()
	if err != nil {
		log.Fatal("error while getting auth middleware:", err.Error())
	}
	err = authMiddleware.MiddlewareInit()
	if err != nil {
		log.Fatal("error while initializing auth middleware:" + err.Error())
	}

	userGroup := apiGroup.Group("users")
	userGroup.Use(authMiddleware.MiddlewareFunc())
	userGroup.GET("", userRouter.RetrieveUser)

	nonAuthUserGroup := apiGroup.Group("users")
	nonAuthUserGroup.POST("register", userRouter.CreateUser)
	nonAuthUserGroup.POST("login", authMiddleware.LoginHandler)
	nonAuthUserGroup.GET("verification", userRouter.VerificateUser)
	nonAuthUserGroup.POST("verification/resend-email", userRouter.ResendVerificationEmail)
	nonAuthUserGroup.POST("password/send-renew-email", userRouter.SendRenewPasswordEmail)
	nonAuthUserGroup.POST("password/renew", userRouter.RenewPassword)

	// submission
	submissionRouter := submission.SubmissionRouter{}

	submissionGroup := apiGroup.Group("submissions")
	submissionGroup.Use(authMiddleware.MiddlewareFunc())
	submissionGroup.POST(":problem_id/create", submissionRouter.CreateSubmission)
	submissionGroup.GET(":id", submissionRouter.RetrieveSubmission)
	submissionGroup.GET("", submissionRouter.GetSubmissions)
	submissionGroup.POST("sourcecode", submissionRouter.UploadSourceCode)
	// submissionGroup.GET("rejudgesubsabcd", submissionRouter.RejudgeAllSubmission)

	// problem
	problemRouter := problem.ProblemRouter{}

	problemGroup := apiGroup.Group("problems")
	problemGroup.Use(authMiddleware.MiddlewareFunc())
	problemGroup.POST(":problem_id", submissionRouter.CreateSubmission) // added to have more meaningful endpoint uri

	// The problem list is public so guests can browse the puzzles without an account.
	apiGroup.GET("problems", problemRouter.GetProblems)

	// support
	supportRouter := support.SupportRouter{}

	supportGroup := apiGroup.Group("support")
	supportGroup.Use(authMiddleware.MiddlewareFunc())
	supportGroup.GET("", supportRouter.GetMessages)
	supportGroup.POST("", supportRouter.SendMessage)

	// announcement
	announcementRouter := announcement.AnnouncementRouter{}

	announcementGroup := apiGroup.Group("announcements")
	announcementGroup.Use(authMiddleware.MiddlewareFunc())
	announcementGroup.GET("", announcementRouter.GetAnnouncements)

	// result
	resultRouter := result.ResultRouter{}

	resultGroup := apiGroup.Group("results")
	resultGroup.Use(authMiddleware.MiddlewareFunc())
	resultGroup.GET("user", resultRouter.GetUserResults)

	// The scoreboard is public so guests can view standings without an account.
	apiGroup.GET("results/scoreboard", resultRouter.GetScoreboard)

	/*
		r.NoRoute(func(c *gin.Context) {
			escapedPath := c.Request.URL.EscapedPath()
			dir, file := path.Split(escapedPath)
			ext := filepath.Ext(file)

			if file == "" || ext == "" {
				c.File(ReactBuildPath + "/index.html")
			} else {
				c.File(ReactBuildPath + "/" + strings.TrimPrefix(path.Join(dir, file), "/"))
			}
		})
	*/

	return nil
}
