export type RepoSnapshot = {
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  homepage: string | null;
  language: string | null;
  updatedAt: string;
  url: string;
};

type GitHubRepoResponse = {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  homepage: string | null;
  language: string | null;
  html_url: string;
  updated_at: string;
};

async function fetchRepoSnapshot(repo: string): Promise<RepoSnapshot | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "amoghjay-portfolio-build"
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GitHubRepoResponse;

    return {
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      homepage: data.homepage,
      language: data.language,
      updatedAt: data.updated_at,
      url: data.html_url
    };
  } catch {
    return null;
  }
}

export async function getRepoSnapshots(repos: Array<string | null | undefined>) {
  const uniqueRepos = [...new Set(repos.filter((repo): repo is string => Boolean(repo)))];
  const settled = await Promise.all(
    uniqueRepos.map(async (repo) => [repo, await fetchRepoSnapshot(repo)] as const)
  );

  return Object.fromEntries(
    settled.filter((entry): entry is readonly [string, RepoSnapshot] => entry[1] !== null)
  );
}

export function formatRepoTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(new Date(timestamp));
}
