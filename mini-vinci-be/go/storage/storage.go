// Package storage builds AWS SDK sessions for an S3-compatible object store.
// It supports both AWS S3 and Cloudflare R2 (via a custom endpoint with
// path-style addressing and static credentials).
package storage

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
)

// Session returns an AWS SDK session configured from the S3 config. When an
// endpoint is set (e.g. Cloudflare R2) it forces path-style addressing; when
// access keys are provided they are used as static credentials, otherwise the
// default AWS credential chain applies.
func Session() (*session.Session, error) {
	cfg := config.Get().S3

	awsCfg := &aws.Config{
		Region: aws.String(cfg.Region),
	}

	if cfg.Endpoint != "" {
		awsCfg.Endpoint = aws.String(cfg.Endpoint)
		awsCfg.S3ForcePathStyle = aws.Bool(true)
	}

	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		awsCfg.Credentials = credentials.NewStaticCredentials(
			cfg.AccessKeyID, cfg.SecretAccessKey, "")
	}

	return session.NewSession(awsCfg)
}
