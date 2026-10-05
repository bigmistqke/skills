/*
 * tracker.ts — the issue tracker a project's bugs name their issues in, and the
 * lookup that holds those names to it: does the issue exist, and is it open.
 *
 * Depends on nothing outside Node: the lookup is `fetch` against the tracker's
 * REST API, and the token is read from the environment, never from the project.
 */

/** The tracker a project keeps its issues in, from the `canon.tracker` field. */
export interface TrackerConfig {
  kind: 'github' | 'gitlab';
  /** GitHub: `owner/name`. */
  repo?: string;
  /** GitLab: the path `group/subgroup/project`, or the numeric id. */
  project?: string | number;
  /**
   * The tracker's address, with or without a scheme (`https` when there is
   * none). GitHub defaults to `github.com` and GitLab to `gitlab.com`; a
   * self-hosted GitHub Enterprise or GitLab names its own.
   */
  host?: string;
  /** The environment variable that holds the token. */
  tokenEnv?: string;
}

/** One issue a bug names, resolved to the tracker that holds it. */
export interface IssueRef {
  kind: 'github' | 'gitlab';
  /** The origin of the site, such as `https://gitlab.example.com`. */
  origin: string;
  /** `owner/name` for GitHub, the path or id for GitLab. */
  project: string;
  number: number;
  /** How the bug wrote it, for a message. */
  written: string;
}

export type IssueState = 'open' | 'closed' | 'missing' | 'pull-request';

export interface IssueResult {
  ref: IssueRef;
  /** `undefined` when the tracker could not be asked; `problem` says why. */
  state?: IssueState;
  problem?: string;
}

const DEFAULT_TOKEN_ENV = { github: 'GITHUB_TOKEN', gitlab: 'GITLAB_TOKEN' } as const;

const originOf = (host: string | undefined, fallback: string): string => {
  const raw = (host ?? fallback).replace(/\/+$/, '');
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
};

/** The project a tracker config names, as a string. */
const projectOf = (tracker: TrackerConfig): string | undefined =>
  tracker.kind === 'github' ? tracker.repo : tracker.project === undefined ? undefined : String(tracker.project);

/** The reasons a `canon.tracker` field is not usable, empty when it is. */
export function trackerProblems(tracker: TrackerConfig): string[] {
  const problems: string[] = [];
  if (tracker.kind !== 'github' && tracker.kind !== 'gitlab') {
    problems.push('"kind" must be "github" or "gitlab"');
  }
  if (tracker.kind === 'github' && !/^[^/\s]+\/[^/\s]+$/.test(tracker.repo ?? '')) {
    problems.push('a github tracker needs "repo": "owner/name"');
  }
  if (tracker.kind === 'gitlab' && (tracker.project === undefined || String(tracker.project) === '')) {
    problems.push('a gitlab tracker needs "project": the path or the numeric id');
  }
  return problems;
}

/**
 * Every issue a bug's text names. A bare `#49` is an issue of the configured
 * tracker. A URL names its own: `…/issues/49` on GitHub, `…/-/issues/49` on
 * GitLab, and only a URL that the configured tracker does not hold needs the
 * site to be one of those two.
 */
export function issueRefs(text: string, tracker: TrackerConfig): IssueRef[] {
  const refs: IssueRef[] = [];
  const own = originOf(tracker.host, tracker.kind === 'github' ? 'github.com' : 'gitlab.com');
  const project = projectOf(tracker);

  for (const found of text.matchAll(/https?:\/\/[^\s)>\]]+?\/issues\/(\d+)\b/g)) {
    const url = new URL(found[0]);
    const number = Number(found[1]);
    const path = url.pathname.replace(/\/issues\/\d+$/, '').replace(/^\/+/, '');
    if (path.endsWith('/-')) {
      refs.push({ kind: 'gitlab', origin: url.origin, project: path.slice(0, -2), number, written: found[0] });
    } else if (url.hostname === 'github.com' || (tracker.kind === 'github' && url.origin === own)) {
      refs.push({ kind: 'github', origin: url.origin, project: path, number, written: found[0] });
    }
  }

  const bare = text.replace(/https?:\/\/\S+/g, ' ');
  if (project !== undefined) {
    for (const found of bare.matchAll(/(?:^|[^\w&])#(\d+)\b/g)) {
      refs.push({ kind: tracker.kind, origin: own, project, number: Number(found[1]), written: `#${found[1]}` });
    }
  }
  return refs;
}

const refKey = (ref: IssueRef): string => `${ref.kind} ${ref.origin} ${ref.project} #${ref.number}`;

const tokenFor = (ref: IssueRef, tracker: TrackerConfig, env: Record<string, string | undefined>): string | undefined => {
  const own = originOf(tracker.host, tracker.kind === 'github' ? 'github.com' : 'gitlab.com');
  const name = ref.kind === tracker.kind && ref.origin === own ? (tracker.tokenEnv ?? DEFAULT_TOKEN_ENV[ref.kind]) : DEFAULT_TOKEN_ENV[ref.kind];
  return env[name] || undefined;
};

const hint = (ref: IssueRef, tracker: TrackerConfig, token: string | undefined): string => {
  const name = ref.kind === tracker.kind ? (tracker.tokenEnv ?? DEFAULT_TOKEN_ENV[ref.kind]) : DEFAULT_TOKEN_ENV[ref.kind];
  return token === undefined ? `no token in ${name}, and a private project answers as if the issue were absent` : `the token in ${name} may lack the access`;
};

/** GitHub: one request for each issue. */
async function askGithub(ref: IssueRef, token: string | undefined, tracker: TrackerConfig): Promise<IssueResult> {
  const api = ref.origin === 'https://github.com' ? 'https://api.github.com' : `${ref.origin}/api/v3`;
  const response = await fetch(`${api}/repos/${ref.project}/issues/${ref.number}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'canon',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  });
  if (response.status === 200) {
    const body = (await response.json()) as { state?: string; pull_request?: unknown };
    if (body.pull_request !== undefined) return { ref, state: 'pull-request' };
    return { ref, state: body.state === 'closed' ? 'closed' : 'open' };
  }
  if (response.status === 404) {
    return token === undefined
      ? { ref, problem: `${ref.project} answered 404: ${hint(ref, tracker, token)}` }
      : { ref, state: 'missing' };
  }
  return { ref, problem: `${ref.project} answered ${response.status}: ${hint(ref, tracker, token)}` };
}

/** GitLab: many issues of one project in one request. */
async function askGitlab(refs: IssueRef[], token: string | undefined, tracker: TrackerConfig): Promise<IssueResult[]> {
  const [first] = refs;
  if (first === undefined) return [];
  const results: IssueResult[] = [];
  for (let at = 0; at < refs.length; at += 50) {
    const chunk = refs.slice(at, at + 50);
    const query = chunk.map((r) => `iids[]=${r.number}`).join('&');
    const response = await fetch(`${first.origin}/api/v4/projects/${encodeURIComponent(first.project)}/issues?${query}&per_page=100`, {
      headers: token ? { 'private-token': token } : {}
    });
    if (response.status !== 200) {
      for (const ref of chunk) {
        results.push({ ref, problem: `${first.project} answered ${response.status}: ${hint(first, tracker, token)}` });
      }
      continue;
    }
    const found = new Map<number, string>();
    for (const issue of (await response.json()) as Array<{ iid: number; state: string }>) found.set(issue.iid, issue.state);
    for (const ref of chunk) {
      const state = found.get(ref.number);
      results.push({ ref, state: state === undefined ? 'missing' : state === 'closed' ? 'closed' : 'open' });
    }
  }
  return results;
}

/**
 * Ask the tracker about every issue named, once each. An issue the tracker
 * could not be asked about comes back with a `problem`, never as `missing`:
 * a private project and a mistyped number answer alike without a token.
 */
export async function lookupIssues(
  refs: IssueRef[],
  tracker: TrackerConfig,
  env: Record<string, string | undefined>
): Promise<Map<string, IssueResult>> {
  const unique = new Map<string, IssueRef>();
  for (const ref of refs) unique.set(refKey(ref), ref);

  const results = new Map<string, IssueResult>();
  const gitlab = new Map<string, IssueRef[]>();
  const github: IssueRef[] = [];
  for (const ref of unique.values()) {
    if (ref.kind === 'github') github.push(ref);
    else gitlab.set(`${ref.origin} ${ref.project}`, [...(gitlab.get(`${ref.origin} ${ref.project}`) ?? []), ref]);
  }

  const record = (result: IssueResult) => results.set(refKey(result.ref), result);
  const guard = async (refsOf: IssueRef[], run: () => Promise<IssueResult[]>) => {
    try {
      for (const result of await run()) record(result);
    } catch (error) {
      const reason = (error as { cause?: { code?: string } }).cause?.code ?? (error as Error).message;
      for (const ref of refsOf) record({ ref, problem: `${ref.origin} could not be reached (${reason})` });
    }
  };

  const queue = [...github];
  await Promise.all(
    Array.from({ length: Math.min(8, queue.length) }, async () => {
      for (let ref = queue.shift(); ref !== undefined; ref = queue.shift()) {
        const token = tokenFor(ref, tracker, env);
        await guard([ref], async () => [await askGithub(ref, token, tracker)]);
      }
    })
  );
  for (const group of gitlab.values()) {
    const [first] = group;
    if (first === undefined) continue;
    await guard(group, () => askGitlab(group, tokenFor(first, tracker, env), tracker));
  }
  return results;
}

export { refKey };
