package utils

import (
	"os"
	"strings"
)

// IsAdminUser reports whether the given email is configured as an admin via the
// ADMIN_EMAILS environment variable (comma-separated, case-insensitive). Admins
// bypass the contest-over submission lock and always see the live scoreboard.
func IsAdminUser(email string) bool {
	if email == "" {
		return false
	}

	raw := os.Getenv("ADMIN_EMAILS")
	if raw == "" {
		return false
	}

	target := strings.ToLower(strings.TrimSpace(email))
	for _, e := range strings.Split(raw, ",") {
		if strings.ToLower(strings.TrimSpace(e)) == target {
			return true
		}
	}

	return false
}
