interface SendResetLinkRequest {
  email: string;
}

export const newSendResetLinkRequest = (
  email: string,
): SendResetLinkRequest => ({
  email,
});
