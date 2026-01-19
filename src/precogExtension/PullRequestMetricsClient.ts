import * as vscode from 'vscode';
import { PullRequestMetrics } from './pullRequestMetrics';
import Logger from '../common/logger';

export class PullRequestMetricsClient {
  private _token: string;
  private _baseUrl: string;

  constructor(token: string, baseUrl: string) {
    this._token = token;
    this._baseUrl = baseUrl;
  }

  async retrieveMetrics(
    repoOwner: string,
    repoName: string,
    prNumber: number
  ): Promise<PullRequestMetrics | undefined> {
    const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest/${prNumber}`;

    const query = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    const data = await query.json();

    if (!query.ok) {
      vscode.window.showErrorMessage(
        vscode.l10n.t(`Failed to retreive metrics for PR #${prNumber}: ${data.message}`)
      );

      return undefined;
    }

    Logger.debug(
      `PR #${prNumber} metrics retrieved.`,
      'Pull Request With Metrics'
    );

    return data;
  }

  async retrieveMultipleMetrics(
    repoOwner: string,
    repoName: string,
    prNumbers: number[]
  ): Promise<Map<number, PullRequestMetrics>> {
    const prNumberQuery = prNumbers.join(',');
    const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest?prNumbers=${prNumberQuery}`;
    const result = new Map();

    const query = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    const data = await query.json();

    if (!query.ok) {
      vscode.window.showErrorMessage(
        vscode.l10n.t(`Failed to retreive metrics for PRs: ${data.message}`)
      );

      return result;
    }

    data.forEach((pr) => {
      result.set(pr.prNumber, pr);
    });

    Logger.debug('Metrics for PRs retrieved.', 'Pull Request With Metrics');

    return result;
  }
}