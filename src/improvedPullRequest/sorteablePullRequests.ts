import * as vscode from 'vscode';
import { PullRequestModel } from '../github/pullRequestModel';
import {
  improvedPullRequest,
  ImprovedPullRequestType,
} from './improvedPullRequest';
import { ImprovedPullRequestClient } from './improvedPullRequestClient';

export class SorteablePullRequests {
  private _sorteablePRs: ImprovedPullRequestType[] = [];
  private _improvedPRClient: ImprovedPullRequestClient;

  constructor(
    prs: PullRequestModel[],
    improvedPRClient: ImprovedPullRequestClient
  ) {
    this._sorteablePRs = prs.map((pr) =>
      improvedPullRequest(pr, improvedPRClient)
    );
    this._improvedPRClient = improvedPRClient;
  }

  public async getSortedPullRequests(): Promise<PullRequestModel[]> {
    if (this._sorteablePRs.length === 0) {
      return [];
    }

    try {
      await this.associateMetrics();
      this._sorteablePRs.sort((a, b) => a.compareTo(b));
    } catch (e) {
      vscode.window.showErrorMessage(vscode.l10n.t(e));
    }

    return this._sorteablePRs;
  }

  private async associateMetrics() {
    const [firstPR] = this._sorteablePRs;
    const prNumbers = this._sorteablePRs.map((pr) => pr.number);
    const { owner: repoOwner, repositoryName: repoName } = firstPR.remote;

    const metricsPrMap = await this._improvedPRClient.retrieveMultipleMetrics(
      repoOwner,
      repoName,
      prNumbers
    );

    this._sorteablePRs.forEach((pr) => {
      const metrics = metricsPrMap.get(pr.number);

      if (metrics) {
        pr.metrics = metrics;
      }
    });
  }
}
