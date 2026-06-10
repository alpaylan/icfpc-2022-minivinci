export interface SupportMessage {
  time: Date;
  message: string;
  isAnswer: boolean;
}

export const supportMessageFromResponse = (response: any): SupportMessage => ({
  time: new Date(response.time),
  message: response.message,
  isAnswer: response.is_answer,
});
