package server

import (
	"os"

	"github.com/gin-gonic/gin"
)

func InitalizeServer() {
	r := gin.Default()

	setUpRouters(r)

	// Bind to all interfaces inside the container; PORT is provided by the host.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run("0.0.0.0:" + port)
	// r.RunTLS(":443", "server/cert.pem", "server/key.pem")
}
