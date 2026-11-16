export interface Commit {
  total_commits: number | null
}

export interface LatestCommit {
  html_url: string
  author: {
    login: string
    avatar_url: string
    html_url: string
  } | null
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
}