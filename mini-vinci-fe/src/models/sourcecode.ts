export interface UploadSourceCode {
  md5: string;
}

export const uploadSourceCodeFromResponse = (response: any): UploadSourceCode => ({
  md5: response.md5,
});
