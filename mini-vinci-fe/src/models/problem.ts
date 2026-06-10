export interface Problem {
  id: number;
  name: string;
  description: string;
  canvasLink: string;
  initialConfigLink: string;
  targetLink: string;
}

export const problemFromResponse = (response: any): Problem => ({
  id: response.id,
  name: response.name,
  description: response.description ?? '',
  canvasLink: response.canvas_link,
  initialConfigLink: response.initial_config_link,
  targetLink: response.target_link,
});
