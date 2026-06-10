// Command seed populates the problems table with the 40 ICFP Contest 2022
// problems, pointing each problem's asset links at ASSETS_BASE_URL.
//
// Problems 1-25 start from a blank canvas; problems 26-40 start from an initial
// configuration (they have <id>.initial.json / <id>.initial.png assets).
//
// Usage (from mini-vinci-be/go):
//
//	go run ./cmd/seed
//
// It reads the same environment configuration as the server (DATABASE_PATH,
// ASSETS_BASE_URL, ...) and is idempotent: re-running upserts by problem id.
package main

import (
	"fmt"

	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/db"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/problem"
	"gorm.io/gorm/clause"
)

// firstProblemWithInitialConfig is the id of the first problem that starts from
// a non-blank canvas. Problems with id >= this value have initial.* assets.
const firstProblemWithInitialConfig = 26

var problemNames = []string{
	"Chess Table",                       // 1
	"RoboPainter",                       // 2
	"Tetris Game",                       // 3
	"ICFP Programming Contest Logo",     // 4
	"ICFP 2022 Logo",                    // 5
	"Haskell Coder's View",              // 6
	"Slovenia Flag",                     // 7
	"Thank You",                         // 8
	"SimpLisa",                          // 9
	"Starry Night",                      // 10
	"Curves",                            // 11
	"SIGPLAN-M",                         // 12
	"Not So SimpLisa",                   // 13
	"Objects Lying Around",              // 14
	"Simply Screaming",                  // 15
	"\"The\" Mona Lisa",                 // 16
	"\"The\" Starry Night",              // 17
	"\"The\" Kiss",                      // 18
	"\"The\" Girl with a Pearl Earring", // 19
	"\"The\" Son of Man",                // 20
	"Special Request",                   // 21
	"Godfather",                         // 22
	"Beatles",                           // 23
	"Inception",                         // 24
	"\"The Girl\"",                      // 25
	"Puzzled Logo",                      // 26
	"Confused Robo Painter",             // 27
	"Obfuscated Starry Night",           // 28
	"Unrecognizable Kiss",               // 29
	"Blocked Curves",                    // 30
	"tepInncio",                         // 31
	"LiaSmpis",                          // 32
	"TSchreaem",                         // 33
	"SvloFelagnai",                      // 34
	"lThrGei",                           // 35
	"Starry Nights",                     // 36
	"Emre's Lisa",                       // 37
	"2 Seasons",                         // 38
	"The Other 2 Seasons",               // 39
	"Logo Wars",                         // 40
}

func main() {
	if err := config.Initialize(); err != nil {
		fmt.Printf("error while initializing config: %v\n", err)
		return
	}

	if err := db.Initialize(); err != nil {
		fmt.Printf("error while initializing database: %v\n", err)
		return
	}

	if err := db.Migrate(&problem.Problem{}); err != nil {
		fmt.Printf("error while migrating database: %v\n", err)
		return
	}

	base := config.Get().S3.AssetsBaseURL

	problems := make([]problem.Problem, 0, len(problemNames))
	for i, name := range problemNames {
		id := uint(i + 1)

		p := problem.Problem{
			Name:        name,
			Description: name,
			TargetLink:  fmt.Sprintf("%s/imageframes/%d.png", base, id),
			// A single space marks "no initial canvas" (the frontend checks
			// canvasLink.length > 3 before rendering an initial-canvas image).
			CanvasLink:        " ",
			InitialConfigLink: " ",
		}
		p.ID = id

		if id >= firstProblemWithInitialConfig {
			p.CanvasLink = fmt.Sprintf("%s/imageframes/%d.initial.png", base, id)
			p.InitialConfigLink = fmt.Sprintf("%s/imageframes/%d.initial.json", base, id)
		}

		problems = append(problems, p)
	}

	// Upsert by primary key so ids stay aligned with the asset filenames.
	err := db.Get().Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name", "description", "target_link", "canvas_link", "initial_config_link", "updated_at",
		}),
	}).Create(&problems).Error
	if err != nil {
		fmt.Printf("error while seeding problems: %v\n", err)
		return
	}

	fmt.Printf("seeded %d problems (assets base: %s)\n", len(problems), base)
}
