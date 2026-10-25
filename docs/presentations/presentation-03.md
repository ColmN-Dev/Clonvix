# Presentation 3 — Project Update

## Progress Summary

Live at [clonvix.onrender.com](https://clonvix.onrender.com)

### Achievements

- Custom user model with email login
- React Router with Home, About, ColmN-Dev and Contact pages
- Responsive header and footer with a hamburger menu
- System, Light and Dark theme toggle
- Homepage hero section started
- Deployed on Render with Neon PostgreSQL
- `repositories` app created, GitHub tokens configured
- README and documentation updated

### Homepage Progress

![Homepage v1 dark](/docs/images/homepage-v1-dark.png)

![Homepage v1 light](/docs/images/homepage-v1-light.png)

### Next Steps

- GitHub API client and repository search
- Homepage search bar, carousels and trending repositories
- Repository cards and detail page
- Registration, login and profiles

## User Roles

| Role | What they can do | Status |
|---|---|---|
| Guest | Search and browse public repositories and profiles; sees "Login to save" | Pages and layout built; search to come |
| Registered User | Save repositories, follow developers, manage profile and GitHub connection | User model built; login and profiles to come |
| GitHub Integration | Developers discoverable without a Clonvix account; follows kept separate from GitHub | Token set up; GitHub App planned |

## Features Breakdown with Dependencies

| Feature | Depends on | Status |
|---|---|---|
| Foundation and deployment | Django, React, Neon, Render | Done |
| Layout, navigation and theme | Foundation | Done |
| Authentication | Custom user model | Model done; login to do |
| Repository discovery | GitHub client, `repositories` app, token | Client to build |
| Repository details | Repository discovery | Not started |
| Repository saving | Authentication, `SavedRepository`, repository cards | Not started |
| Following developers | Authentication, `Follow`, `GitHubFollow` | Not started |
| User profiles | Authentication, profile data | Not started |
| GitHub connection and login | Authentication, GitHub App | Not started |

### Order of Work

- Deployment first, so every feature can be tested live
- User model before other tables, as they link to it
- GitHub client next, as search, cards and details depend on it

### GitHub Code Structure

- `github_client.py` makes the raw GitHub API calls
- `services.py` adds caching and shapes the data
- `views.py` and `urls.py` send results to React

## Potential Challenges with Contingency Plans

### Met So Far

| Challenge | Solution |
|---|---|
| Serving React from Django | WhiteNoise, a build script and a catch-all route, built and checked step by step |
| Theme following the OS and the user's choice | `data-theme` attribute only when the user picks Light or Dark |
| Mobile menu covering the theme dropdown | Raised the dropdown's `z-index`; made the menu scrollable on short screens |

### Still Ahead

| Challenge | Contingency Plan |
|---|---|
| GitHub rate limits or outages | Server-side token, caching, clear errors with retry |
| Expired GitHub token | Check the token first if requests fail; tokens expire after a set period |
| Authentication and GitHub linking | Test each flow separately; validate accounts before linking |
| Inconsistent saved state | Shared React components and one backend API |
| Scope and time | Core features first; trending repositories last |

## User Flow with Mock Interactions

- User finds a repository, views details and saves it
- Guests are asked to log in or register before saving
- Saved repositories are reached from the profile page
- **Built so far:** pages and navigation
- **Still to come:** search, repository details, saving

### User Journey

![Clonvix User Journey](/docs/images/user-journey.png)

## Site Map with Navigation Logic

- Main navigation: repository discovery and developer profiles
- After login: Saved Repositories and Account Settings
- Your Repositories only shows when GitHub is connected
- **Built so far:** Home, About, ColmN-Dev and Contact in the header
- On small screens the links move into a slide-out menu

### What Changed from the Plan

- Frontend and backend deployed as one Render service
- Separate `repositories` app added for GitHub features

### Site Map

![Site Map](/docs/images/clonvix-site-map.png)

## Learnings

- Serving a built React app from Django with WhiteNoise and a build script
- React Router, TypeScript and hooks for the header, menu and theme toggle
- CSS variables with a `data-theme` attribute and the OS preference
- Separating code by responsibility, and GitHub features from accounts
- Keeping tokens in environment variables, separate for local and production