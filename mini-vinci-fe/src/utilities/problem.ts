export const getProblemIDs = (): string[] => {
  const problemCount = parseInt(process.env.REACT_APP_PROBLEM_COUNT ?? '0', 10);
  const problemIDs: string[] = [];
  for (let i = 1; i <= problemCount; i += 1) {
    problemIDs.push(i.toString());
  }
  return problemIDs;
};
