export interface Repository {
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  default_branch: string
  archived: boolean
  visibility: string
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
}