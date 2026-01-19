import * as vscode from 'vscode';
import { PullRequestMetricsClient } from './PullRequestMetricsClient';
import {
  pullRequestWithMetrics,
  PullRequestWithMetrics,
} from './pullRequestWithMetrics';
import { PullRequestModel } from '../github/pullRequestModel';

export class SortablePullRequests {
  private _sortablePRs: PullRequestWithMetrics[] = [];
  private _precogClient: PullRequestMetricsClient;

  constructor(
    prs: PullRequestModel[],
    precogClient: PullRequestMetricsClient
  ) {
    this._sortablePRs = prs.map((pr) =>
      pullRequestWithMetrics(pr, precogClient)
    );
    this._precogClient = precogClient;
  }

  public async getSortedPullRequests(): Promise<PullRequestModel[]> {
    if (this._sortablePRs.length === 0) {
      return [];
    }

    try {
      await this.associateMetrics();
      this._sortablePRs.sort((a, b) => a.compareTo(b));
    } catch (e) {
      vscode.window.showErrorMessage(vscode.l10n.t(e));
    }

    return this._sortablePRs;
  }

  private async associateMetrics() {
    const [firstPR] = this._sortablePRs;
    const prNumbers = this._sortablePRs.map((pr) => pr.number);
    const { owner: repoOwner, repositoryName: repoName } = firstPR.remote;

    const metricsPrMap = await this._precogClient.retrieveMultipleMetrics(
      repoOwner,
      repoName,
      prNumbers
    );

    this._sortablePRs.forEach((pr) => {
      const metrics = metricsPrMap.get(pr.number);

      if (metrics) {
        pr.metrics = metrics;
      }
    });
  }
}
