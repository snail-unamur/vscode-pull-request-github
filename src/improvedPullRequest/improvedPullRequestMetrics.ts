export type ImprovedPullRequestMetrics = {
    riskCategory: string,
    riskValue: number,
    radarMetrics: Metric[],
}

export type Metric = {
    id: string
    name: string,
    fullName: string,
    description: string,
	radarValue: number,
}