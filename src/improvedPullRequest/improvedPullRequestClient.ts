import * as vscode from 'vscode';
import Logger from '../common/logger';
import { ImprovedPullRequestMetrics } from './improvedPullRequestMetrics';

export class ImprovedPullRequestClient {
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
  ): Promise<ImprovedPullRequestMetrics | undefined> {
    const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest/${prNumber}`;

    try {
      const query = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      });

      const data = await query.json();

      Logger.debug(
        `PR #${prNumber} metrics retrieved.`,
        'Improved Pull Request'
      );

      return data.analysis;
    } catch (error) {
      vscode.window.showErrorMessage(
        vscode.l10n.t(`Failed to retreive metrics for PR #${prNumber}`)
      );
    }

    return undefined;
  }

  async retrieveMultipleMetrics(
    repoOwner: string,
    repoName: string,
    prNumbers: number[]
  ): Promise<Map<number, ImprovedPullRequestMetrics>> {
    const prNumberQuery = prNumbers.join(',');
    const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest?prNumbers=${prNumberQuery}`;
    const result = new Map();

    try {
      const query = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      });

      Logger.debug('Metrics for PRs retrieved.', 'Improved Pull Request');

      const data = await query.json();

      data.forEach((pr) => {
        result.set(pr.prNumber, pr.analysis);
      });

      return result;
    } catch (error) {
      throw Error('Failed to retreive metrics for PRs.');
    }
    return result;
  }
}
