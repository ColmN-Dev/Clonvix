# Project Plan — Clonvix

## Project Overview

Clonvix is a full-stack web application inspired by GitHub, designed to bring repository discovery, developer profiles, saved repositories and following developers together in one place.

Visitors will be able to search public GitHub repositories, view repository details and browse available contents without creating an account. Registered users will be able to save repositories, follow GitHub developers and manage their own Clonvix profiles.

Developers can be followed through Clonvix even if they have never registered with the platform. Users will also be able to connect their GitHub accounts to display their public profile information and repositories.

The application will include a dedicated ColmN-Dev showcase for my development projects, alongside separate About and Contact pages.

## Project Purpose

The purpose of Clonvix is to make discovering software projects and developers straightforward, while providing a single place to save interesting repositories and follow developers.

The project will also allow me to build a substantial full-stack application, bringing together frontend development, backend APIs, database management, authentication, external API integration, testing and deployment.

## Scope and Features

The application will include the following features:

- **Repository discovery:** Search public GitHub repositories and view relevant project information.

- **Repository exploration:** View repository details and browse available contents, with links to the original GitHub projects.

- **User accounts:** Registration, login, logout, profile management, password reset and password change.

- **GitHub login:** Allow users to sign in through GitHub after their GitHub account has been connected to an existing Clonvix account.

- **Saved repositories:** Save and remove public repositories for later reference, independently of GitHub stars.

- **Following developers:** Follow and unfollow GitHub developers through Clonvix, including developers without Clonvix accounts.

- **Developer profiles:** Display available public GitHub information alongside Clonvix following relationships.

- **GitHub integration:** Connect a GitHub account to an existing Clonvix profile, display public repositories and support GitHub login for linked accounts.

- **ColmN-Dev showcase:** Present my development projects using live GitHub information and links to their repositories, displayed through Clonvix's own interface.

- **About and Contact:** Provide separate pages explaining the application and allowing visitors to send a message.

Saving repositories and following developers on Clonvix will remain separate from starring repositories and following users on GitHub.

## Technology Stack

- **React and TypeScript:** Build the frontend interface and manage its interactions.

- **Django and Django REST Framework:** Handle backend logic, API endpoints, authentication-related operations and data access.

- **PostgreSQL:** Store Clonvix user accounts, saved repositories and following relationships.

- **GitHub REST API:** Retrieve public repository and developer information.

- **GitHub OAuth integration:** Support GitHub account connection and login for accounts that have already been linked to Clonvix.

- **Bootstrap and custom CSS:** Build the interface layout and establish Clonvix's own visual styling.

- **Django's local-memory cache:** Temporarily cache selected GitHub API responses to reduce repeated requests.

- **Brevo:** Deliver Contact form messages and password-reset emails.

- **Git and GitHub:** Manage source code and track development changes.

- **Automated and manual testing:** Verify application functionality and integration behaviour.

- **Render and Neon:** Host the application and provide the production PostgreSQL database.

## Design and User Experience

Clonvix will use a clean interface with light green accents and light and dark themes. Light mode will have a white background, while dark mode will have a near-black background. Bootstrap will provide the layout foundation, with custom CSS defining the application's visual identity.

Repository discovery will be central to the interface, making it straightforward to search projects and explore their contents. Repository cards will provide relevant information at a glance, with expandable sections allowing users to view additional repository information without leaving the current page.

### Repository Cards and Exploration

Repository cards will be used across Search Results, Saved Repositories and Your Repositories, with shared presentation and behaviour where appropriate.

- **Search Results:** Display repositories returned by the GitHub API. An expandable section will show additional metadata, including the current star count where available.

- **Saved Repositories:** Display repositories saved by the user, allowing them to revisit projects later. Expandable sections can retrieve updated repository metadata, while selecting a repository opens its detail page.

- **Your Repositories:** Display public repositories owned by the user's connected GitHub account, using the same general card and expandable-section design.

- **Repository Detail:** Display more comprehensive repository information, including the file tree and source code where available. File contents will be retrieved through live GitHub API requests rather than cached.

Selecting a repository card will navigate to its dedicated detail page. Saving a repository will not automatically star it on GitHub.

### Homepage

The homepage will feature repository discovery content, including programming-language carousels and a Trending This Week section.

Trending This Week will display the top three repositories across all programming languages, ranked by stars gained during the preceding seven days where reliable data is available. The results will be cached for one hour to reduce repeated requests.

### Developer Profiles

Developer profiles will connect projects with the people behind them. The profile layout will use two columns and display profile information, follower and following counts, and optional social links.

Users will be able to provide up to four social URLs. Clonvix will identify recognised platforms from the URLs where possible and display an appropriate platform label and icon, without restricting users to a fixed list of platforms.

A separate Edit Profile page will allow users to update their profile information, social URLs and profile picture. Profile picture uploads will use Cloudinary.

Account Settings will be separate from the public profile and will provide account-management functionality, including password changes, GitHub connection management and account deletion.

### GitHub Connection and Login

Users will register on Clonvix using an email address, username and password. They will be able to log in using their email address and password or, once their GitHub account has been connected, through GitHub.

Connecting GitHub will be an explicit action available to authenticated Clonvix users. GitHub login will authenticate the user through GitHub and verify that the returned GitHub account ID is already linked to a Clonvix account.

If the GitHub account is not connected, the user will be redirected to the login page with a warning explaining that they must log in using their Clonvix credentials and connect GitHub through Account Settings first.

### ColmN-Dev Showcase, About and Contact

The ColmN-Dev showcase will present my development work through Clonvix's own interface, using live GitHub information and links to the original repositories. Project information will update as the underlying public GitHub data changes, subject to caching.

About and Contact will remain separate pages. The Contact form will allow visitors to send a message without needing to create an account.

Wireframes will guide the layout of the main pages.

## GitHub API and Caching Strategy

Clonvix will use Django's built-in local-memory cache to reduce repeated GitHub API requests and improve response times. Different cache durations will be used according to how frequently the data is expected to change.

The initial caching strategy will be:

- **Repository search results:** Cache results for approximately 5–10 minutes.

- **Repository card metadata:** Cache information used by expandable repository cards, including star counts, for approximately 5 minutes.

- **Trending This Week:** Cache the top five trending repositories for one hour.

- **Your Repositories:** Cache repository listings from the connected GitHub account for approximately 10–15 minutes.

- **ColmN-Dev showcase:** Cache selected GitHub profile and repository information for a short period to reduce repeated requests.

- **Repository detail contents:** Do not cache file trees or source code. Retrieve these through live GitHub API requests when required.

Saved Repositories will store a snapshot of selected repository details at the time of saving. When a user revisits or expands a saved repository, Clonvix can retrieve updated metadata through the GitHub API, using the short-lived repository metadata cache where appropriate.

### Local-Memory Cache Behaviour

Django's local-memory cache stores cached data in the application's process memory rather than in PostgreSQL or a separate caching service. It does not require Redis or another external caching server, making it straightforward to configure and use during development and deployment.

Cached data is temporary. Entries can expire according to their configured time limits, and restarting the application clears its in-memory cache. Cache contents are also separate between application processes, meaning that multiple workers may maintain different cached copies of the same data.

Consequently, local-memory caching can reduce repeated API requests handled by the same process, but it does not guarantee that every request will use the same cached data. A cache miss, expired entry or application restart can require another GitHub API request.

The cache will therefore be used only as a performance optimisation. Permanent application data, including user accounts, saved repository records and follow relationships, will be stored in PostgreSQL rather than relying on the cache.

### Trending Data

Trending data will be based on repositories across all languages that have gained the most stars during the preceding seven days. Because GitHub's REST API does not provide a dedicated endpoint for an exact weekly trending ranking, the implementation will need to establish a practical method of identifying and ranking those repositories.

## Development Approach

Development will proceed incrementally, beginning with the application setup and GitHub API integration. Repository discovery and the guest experience will be developed first, followed by user accounts, authentication and features such as profile management, saved repositories and following developers.

GitHub account connection and GitHub login will be implemented after the core email-and-password authentication flow is working. Repository cards and their expandable sections will be reused across relevant pages to avoid unnecessary duplication.

Responsive design, testing and refinement will take place throughout development, alongside the implementation of the remaining features.

## Database Design

Clonvix will use PostgreSQL as its relational database, with Django's ORM handling database models and relationships.

The database will store Clonvix user accounts, profile information, GitHub connections, saved repositories and follow relationships. GitHub data such as repository details, search results and developer profile information will be retrieved through the GitHub API and cached where appropriate rather than stored permanently in the database.

### Planned Database Tables

| Table | Purpose |
|---|---|
| `User` | Stores user account information, including email-based authentication and a unique username used in profile URLs. |
| `Profile` | Stores additional profile information, including display name, biography, profile image and up to four optional social URLs. |
| `UsernameChangeLog` | Records previous usernames when a username changes, allowing old profile URLs to resolve to the user's current profile. |
| `GitHubConnection` | Links a Clonvix account to its connected GitHub account using the GitHub account's stable, unique ID. |
| `SavedRepository` | Stores repositories that a user chooses to save, including a snapshot of selected repository details at the time of saving. |
| `Follow` | Stores follow relationships between Clonvix users. |
| `GitHubFollow` | Stores follow relationships between a Clonvix user and a GitHub developer, independently of Clonvix follow relationships. |

### Database Design and Relationships

An Entity Relationship Diagram (ERD) will be created before implementation to define the relationships, primary keys, foreign keys and constraints for each table.

The design will distinguish between Clonvix user relationships and GitHub developer relationships. Connecting a GitHub account will not automatically create or modify Clonvix follow relationships.

The `saved_repository` table will preserve selected repository information as a snapshot, allowing users to retain a reference even if current metadata cannot be retrieved.

The `username_change_log` table will support the resolution of old username-based profile URLs. Username changes and registration will be validated to prevent username conflicts and the unauthorised reuse of previously registered usernames.

The database structure will be reviewed against the planned features before the models and initial migrations are created. Any changes to the planned tables will be documented as the design develops.

[dbdiagram.io](https://dbdiagram.io/) was used to generate the diagram.

The DBML code used to create the diagram can be found here: [Clonvix ERD DBML](/docs/clonvix-erd.dbml).

The generated database schema diagram can be found here: [Clonvix ERD](/docs/clonvix-erd.png).

## Presentation Summaries

### Presentation 1 — Project Brief

Presentation 1 sets out the foundation of Clonvix: the problem it addresses, the application concept and user scenarios, the target audience, core features, technology stack rationale, success criteria and initial wireframes. The full content is in [Presentation 1 — Project Brief](docs/presentations/presentation-01.md).