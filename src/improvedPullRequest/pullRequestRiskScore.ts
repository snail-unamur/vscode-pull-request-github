type PullRequestRiskScore = {
  number: number;
  analysis: {
    risk_score: {
      score: number;
    };
  };
};