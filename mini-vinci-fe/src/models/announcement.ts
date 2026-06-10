export interface Announcement {
  time: Date;
  content: string;
}

export const announcementFromResponse = (response: any): Announcement => ({
  time: new Date(response.time),
  content: response.content,
});
