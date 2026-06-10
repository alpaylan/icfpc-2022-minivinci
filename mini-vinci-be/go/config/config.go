package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

var (
	internalConfig Config
)

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Async    AsyncConfig
	Email    EmailConfig
	Redis    RedisConfig
	S3       S3Config
	Judge    JudgeConfig
	Logging  LoggingConfig
}

// DatabaseConfig points at a local SQLite database file.
type DatabaseConfig struct {
	Path string
}

type JWTConfig struct {
	LoginSecret             string
	LoginExpireTime         time.Duration
	VerificationSecret      string
	VerificationExpireTime  time.Duration
	RenewPasswordSecret     string
	RenewPasswordExpireTime time.Duration
}

type AsyncConfig struct {
	// Eager runs email/evaluation tasks synchronously, removing the Redis dependency.
	Eager bool
}

// RedisConfig is only used when Async.Eager is false (background worker mode).
type RedisConfig struct {
	Address string
}

type EmailConfig struct {
	// Enabled gates outbound email (AWS SES). When disabled, users are auto-verified
	// on registration and password-reset emails become no-ops.
	Enabled          bool
	SESRegion        string
	From             string
	VerificationURL  string
	RenewPasswordURL string
}

// S3Config describes an S3-compatible object store (AWS S3 or Cloudflare R2).
type S3Config struct {
	// Endpoint is the S3-compatible endpoint. Leave empty for AWS S3; set to the
	// R2 endpoint (https://<account-id>.r2.cloudflarestorage.com) for Cloudflare R2.
	Endpoint              string
	Region                string
	SubmissionsBucketName string
	SourceCodeBucketName  string
	AccessKeyID           string
	SecretAccessKey       string
	// AssetsBaseURL is the public base URL serving problem assets (imageframes/*)
	// and frozen_scoreboard.json. Used by the scoreboard endpoint and shared with
	// the frontend/judge.
	AssetsBaseURL string
}

// JudgeConfig locates the Node-based ISL judge that evaluations shell out to.
type JudgeConfig struct {
	// Dir is the working directory of the built judge (containing dist/ISLRunner.js).
	Dir string
}

type LoggingConfig struct {
	OutputFile string
	Level      string
}

// Initialize reads all configuration from environment variables, applying
// development-friendly defaults. No secrets are read from files on disk.
func Initialize() error {
	submissionsBucket := env("S3_SUBMISSIONS_BUCKET", "minivinci-submissions")

	internalConfig = Config{
		Database: DatabaseConfig{
			Path: env("DATABASE_PATH", "minivinci.db"),
		},
		JWT: JWTConfig{
			LoginSecret:             env("JWT_LOGIN_SECRET", "dev-login-secret-change-me"),
			LoginExpireTime:         time.Duration(envInt("JWT_LOGIN_EXPIRE_HOURS", 24)),
			VerificationSecret:      env("JWT_VERIFICATION_SECRET", "dev-verification-secret-change-me"),
			VerificationExpireTime:  time.Duration(envInt("JWT_VERIFICATION_EXPIRE_HOURS", 24)),
			RenewPasswordSecret:     env("JWT_RENEW_PASSWORD_SECRET", "dev-renew-secret-change-me"),
			RenewPasswordExpireTime: time.Duration(envInt("JWT_RENEW_PASSWORD_EXPIRE_HOURS", 24)),
		},
		Async: AsyncConfig{
			Eager: envBool("ASYNC_EAGER", true),
		},
		Redis: RedisConfig{
			Address: env("REDIS_ADDRESS", "localhost:6379"),
		},
		Email: EmailConfig{
			Enabled:          envBool("EMAIL_ENABLED", false),
			SESRegion:        env("EMAIL_SES_REGION", "us-east-1"),
			From:             env("EMAIL_FROM", ""),
			VerificationURL:  env("EMAIL_VERIFICATION_URL", ""),
			RenewPasswordURL: env("EMAIL_RENEW_PASSWORD_URL", ""),
		},
		S3: S3Config{
			Endpoint:              env("S3_ENDPOINT", ""),
			Region:                env("S3_REGION", "auto"),
			SubmissionsBucketName: submissionsBucket,
			SourceCodeBucketName:  env("S3_SOURCECODE_BUCKET", submissionsBucket),
			AccessKeyID:           env("S3_ACCESS_KEY_ID", ""),
			SecretAccessKey:       env("S3_SECRET_ACCESS_KEY", ""),
			AssetsBaseURL: strings.TrimRight(
				env("ASSETS_BASE_URL", "https://s3.amazonaws.com/cdn.robovinci.xyz"), "/"),
		},
		Judge: JudgeConfig{
			Dir: env("JUDGE_DIR", "../../mini-vinci-judge"),
		},
		Logging: LoggingConfig{
			OutputFile: env("LOG_OUTPUT_FILE", ""),
			Level:      env("LOG_LEVEL", "info"),
		},
	}

	return nil
}

func Get() Config {
	return internalConfig
}

func env(key, def string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return def
}

func envBool(key string, def bool) bool {
	if v, ok := os.LookupEnv(key); ok {
		switch strings.ToLower(strings.TrimSpace(v)) {
		case "1", "true", "yes", "on":
			return true
		case "0", "false", "no", "off":
			return false
		}
	}
	return def
}

func envInt(key string, def int) int {
	if v, ok := os.LookupEnv(key); ok {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil {
			return n
		}
	}
	return def
}
