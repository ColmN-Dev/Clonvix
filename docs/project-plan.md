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

- **Saved repositories:** Save and remove public repositories for later reference, independently of GitHub stars.

- **Following developers:** Follow and unfollow GitHub developers through Clonvix, including developers without Clonvix accounts.

- **Developer profiles:** Display available public GitHub information alongside Clonvix following relationships.

- **GitHub integration:** Connect a GitHub account to an existing Clonvix profile, display public repositories and allow GitHub sign-in for existing users who have connected their accounts.

- **ColmN-Dev showcase:** Present my development projects with descriptions, screenshots and source-code links.

- **About and Contact:** Provide separate pages explaining the application and allowing visitors to send a message.

Saving repositories and following developers on Clonvix will remain separate from starring repositories and following users on GitHub.

## Technology Stack

- **React and TypeScript:** Build the frontend interface and manage its interactions.

- **Django and Django REST Framework:** Handle backend logic, API endpoints, authentication-related operations and data access.

- **PostgreSQL:** Store Clonvix user accounts, saved repositories and following relationships.

- **GitHub REST API:** Retrieve public repository and developer information.

- **GitHub integration:** Support GitHub account connection and authorisation, with the implementation details finalised during development.

- **Bootstrap and custom CSS:** Build the interface layout and establish Clonvix's own visual styling.

- **Resend:** Deliver Contact form messages and password-reset emails.

- **Git and GitHub:** Manage source code and track development changes.

- **Automated and manual testing:** Verify application functionality and integration behaviour.

- **Render and Neon:** Host the application and provide the production PostgreSQL database.

## Design and User Experience

Clonvix will use a clean interface with light green accents and light and dark themes. Light mode will have a white background, while dark mode will have a black background. Bootstrap will provide the layout foundation, with custom CSS defining the application's visual identity.

Repository discovery will be central to the interface, making it straightforward to search projects and explore their contents. Developer profiles will connect projects with the people behind them.

The user's profile will use a two-column layout, with profile information, Followers and Following, and optional social media links. A separate **GitHub Integration** section will appear beneath the social media links.

When GitHub is disconnected, the section will display "Connect your GitHub account to display your public repositories" followed by a **Connect GitHub** button.

When connected, it will display **Status: Connected** and a **Disconnect GitHub** button.

The ColmN-Dev showcase will present my development work, while About and Contact will remain separate pages. Wireframes will guide the layout of the main pages.

## Development Approach

Development will proceed incrementally, beginning with the application setup and GitHub API integration. Repository discovery and the guest experience will be developed first, followed by user accounts, authentication and features such as profile management, saved repositories and following developers.

Responsive design, testing and refinement will take place throughout development, alongside the implementation of the remaining features.

## Presentation Summaries

### Presentation 1 — Project Brief

Presentation 1 sets out the foundation of Clonvix: the problem it addresses, the application concept and user scenarios, the target audience, core features, technology stack rationale, success criteria and initial wireframes. The full content is in [Presentation 1 — Project Brief](docs/presentations/presentation-01.md).