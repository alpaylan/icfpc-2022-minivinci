export interface UserScore {
  order: number;
  userID: number;
  teamName: string;
  totalCost: number;
  solvedProblemCount: number;
}
export const userScoreFromResponse = (
  response: any,
  order: number,
): UserScore => ({
  order,
  userID: response.user_id,
  teamName: response.team_name,
  totalCost: response.total_cost,
  solvedProblemCount: response.solved_problem_count,
});

export interface Scoreboard {
  isFrozen: boolean;
  lastUpdatedAt: Date;
  userScores: UserScore[];
}
export const scoreboardFromResponse = (response: any): Scoreboard => ({
  isFrozen: response.is_frozen,
  lastUpdatedAt: new Date(response.last_updated_at),
  userScores: response.users.map((userScore: any, order: number) =>
    userScoreFromResponse(userScore, order + 1),
  ),
});
