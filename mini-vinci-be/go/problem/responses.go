package problem

import "sort"

type SingleProblemResponse struct {
	ID                uint   `json:"id"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	CanvasLink        string `json:"canvas_link"`
	InitialConfigLink string `json:"initial_config_link"`
	TargetLink        string `json:"target_link"`
}

type GetProblemsResponse struct {
	Problems []SingleProblemResponse `json:"problems"`
}

type GetProblemsSerializer struct {
	Problems []Problem
}

func (s GetProblemsSerializer) Response() GetProblemsResponse {
	resp := GetProblemsResponse{Problems: make([]SingleProblemResponse, 0)}

	for _, p := range s.Problems {
		resp.Problems = append(resp.Problems, SingleProblemResponse{
			ID:                p.ID,
			Name:              p.Name,
			Description:       p.Description,
			CanvasLink:        p.CanvasLink,
			InitialConfigLink: p.InitialConfigLink,
			TargetLink:        p.TargetLink,
		})
	}

	sort.Slice(resp.Problems, func(i, j int) bool {
		return resp.Problems[i].ID < resp.Problems[j].ID
	})

	return resp
}
