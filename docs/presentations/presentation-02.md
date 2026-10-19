# Presentation 2 — Project Brief

## User Roles

### Guest

Guests can search and explore public GitHub repositories, browse repository contents and view developer profiles without registering.

Account-specific actions require authentication. For example, repository cards display a "Login to save" link to guests, which redirects them to the login page. Guests can register if they do not already have an account.

### Registered User

Registered users can save and remove repositories, follow and unfollow developers, and manage their Clonvix profiles.

Users can save or remove repositories directly from repository cards on the homepage and search results, as well as from the repository detail page. The saved state will remain consistent across all three locations.

Account Settings provides access to account management and GitHub connection controls. Connecting GitHub enables the user's public repositories to be displayed and allows GitHub login for the linked Clonvix account.

### GitHub Integration

GitHub developers do not need a Clonvix account to have their public profiles and repositories discovered. Clonvix retrieves this information through the GitHub API.

Clonvix following relationships remain separate from GitHub's own following system. The `Follow` and `GitHubFollow` database tables will manage these separate relationships, distinguishing follows between Clonvix users and follows involving GitHub developers.

## Features Breakdown with Dependencies

### Authentication

Authentication allows users to register, log in and access their Clonvix accounts. It is required for account-specific features such as saving repositories, following developers and managing profiles. Guests can still browse public repositories and developer profiles without logging in.

### Repository Discovery

Repository discovery relies on the GitHub REST API to retrieve public repository information. The homepage displays repository collections, while search results allow users to find repositories based on their interests. Repository cards are reused across the homepage and search results to maintain consistent presentation and behaviour.

### Repository Details

The repository detail page depends on repository information retrieved from GitHub. It displays repository metadata and allows users to browse the repository's file tree and source code. File tree and source code requests retrieve current information from GitHub rather than relying on cached responses.

The detail page also provides repository-saving functionality for authenticated users, reusing the save-button component available on repository cards.

### Repository Saving

Repository saving depends on authentication and the `SavedRepository` database table. Authenticated users can save or remove repositories from the homepage, search results and repository detail page.

The shared React components and backend functionality ensure that a repository's saved state remains consistent across these locations. Guests are shown a "Login to save" link instead of the bookmark control.

### Following Developers

Following developers depends on authentication and the `Follow` and `GitHubFollow` database tables. These tables distinguish relationships between Clonvix users and GitHub developers from relationships involving GitHub's own following system.

Developers can be discovered and viewed through their public GitHub information without needing a Clonvix account.

### GitHub Integration

GitHub integration depends on users linking their GitHub accounts through the authorisation process. Once connected, their public repositories can be displayed within Clonvix, and GitHub login can be used for the linked Clonvix account.

GitHub login is available only to existing Clonvix users who have already linked their GitHub account. It does not provide a separate registration process.

### User Profiles

User profiles depend on account information and associated profile data. Users can manage their profile details, profile picture and social links. Profile pages can also display follower and following information, alongside GitHub information where available.

Profile editing and account management require authentication.

## Potential Challenges with Contingency Plans

### GitHub API Limitations

GitHub API rate limits or outages could prevent repository and developer information from loading.

**Contingency Plan:** Display clear error messages and allow users to retry. Cache suitable responses to reduce unnecessary API requests.

### Authentication and GitHub Integration

Linking GitHub accounts and handling different login methods could introduce authentication issues.

**Contingency Plan:** Test each authentication flow separately and validate accounts before linking them.

### Consistent Repository Saving

Saving or removing repositories from different pages could cause inconsistencies if the saved state isn't updated correctly.

**Contingency Plan:** Reuse React components and a common backend API to keep saved repositories consistent across the application.

### External Service Availability

Issues with hosting, the database or other external services could affect parts of Clonvix.

**Contingency Plan:** Handle failures gracefully and maintain database backups and deployment documentation.

### Project Scope and Time Management

With several features to build and test, some tasks could take longer than expected.

**Contingency Plan:** Focus on the core features first and leave less essential enhancements until the main application is complete. For example, features such as Trending This Week could be deprioritised if time becomes limited.

## User Flow with Mock Interactions

This user flow shows how someone can find a repository on Clonvix, view its details and save it to their account. Guests are prompted to log in or register before saving. They can then access the repository through Saved Repositories on their profile page.

### User Journey

![Clonvix User Journey](/docs/images/user-journey.png)

## Site Map with Navigation Logic

The site map shows how Clonvix pages are organised and connected. The main navigation gives users access to repository discovery and developer profiles, while account-specific pages such as Saved Repositories and Account Settings are available after logging in. Your Repositories is only available when a GitHub account is connected.

### Site Map

![Site Map](/docs/images/clonvix-site-map.png)