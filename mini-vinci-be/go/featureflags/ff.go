package featureflags

import (
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

const (
	DefaultValueAllowLogin       = true
	DefaultValueAllowSubmission  = true
	DefaultValueUpdateScoreboard = true
)

type FeatureFlags struct {
	AllowLogin       bool `yaml:"allow_login"`
	AllowSubmission  bool `yaml:"allow_submission"`
	UpdateScoreboard bool `yaml:"update_scoreboard"`
}

func GetFeatureFlags() (FeatureFlags, error) {
	var ff FeatureFlags

	ymlFile, err := ioutil.ReadFile("featureflags.yml")
	if err != nil {
		logging.Logger.WithError(err).Errorf("could not open featureflags.yml")
		return FeatureFlags{}, err
	}

	err = yaml.Unmarshal(ymlFile, &ff)
	if err != nil {
		logging.Logger.WithError(err).Errorf("could not unmarshall feature flags")
		return FeatureFlags{}, err
	}

	return ff, nil
}

func IsLoginAllowed() bool {
	ff, err := GetFeatureFlags()

	if err != nil {
		return DefaultValueAllowLogin
	}

	return ff.AllowLogin
}

func IsSubmissionAllowed() bool {
	ff, err := GetFeatureFlags()

	if err != nil {
		return DefaultValueAllowSubmission
	}

	return ff.AllowSubmission
}

func ShouldUpdateScoreboard() bool {
	ff, err := GetFeatureFlags()

	if err != nil {
		return DefaultValueUpdateScoreboard
	}

	return ff.UpdateScoreboard
}
