# Presentation 1 — Project Brief

## Background and Context

GitHub is a major platform for discovering open-source software, exploring repositories and learning from other developers. However, its extensive features and technical information can be overwhelming for people who are new to software development or unfamiliar with the platform.

GitHub's 2025 Octoverse report highlighted the scale of this developer community, reporting more than 180 million developers and over 630 million repositories. This creates an enormous resource for learning and collaboration, but it can also make finding relevant projects and developers a challenge.

Source: [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)

Clonvix was inspired by my own experience of learning about GitHub and its features while developing projects. The aim is to make discovering repositories, exploring developers and keeping track of interesting projects more straightforward.

## Application Concept

Clonvix is a web application that combines GitHub repository discovery, developer profiles and personal organisation features in one interface.

Visitors can search and browse public repositories and developer profiles without creating an account. Registered users can save repositories for later, follow GitHub developers within Clonvix and manage their own profiles. Users can also connect their GitHub accounts to display their public profile and repositories.

GitHub developers can be followed through Clonvix even if they have never registered with the platform.

The application also includes a personal developer showcase, ColmN-Dev, with separate About and Contact pages.

The central idea is to make GitHub-related discovery more approachable without attempting to replace GitHub itself.

### User Scenarios

| Scenario | User interaction | Benefit |
|---|---|---|
| Discovering projects | A beginner searches for Python repositories and explores a project's details and files. | Makes it easier to find real-world code to learn from. |
| Saving useful work | A registered user saves repositories and revisits them later. | Keeps interesting projects organised in one place. |
| Following developers | A registered user follows a developer through Clonvix. | Makes it easier to keep track of developers without changing their GitHub following list. |
| Exploring developer work | A visitor opens a developer's profile and explores their available information and links. | Makes it easier to discover developers and their work. |

## Target Audience

Clonvix is intended for people who want to discover software projects, learn from existing code, follow developers or present their own development work.

| Audience | Needs and behaviours | Design considerations |
|---|---|---|
| Beginner developers | Look for examples, explore unfamiliar repositories and learn new technologies. | Clear navigation, understandable labels and straightforward access to repository information. |
| Developers learning new technologies | Compare projects and return to useful examples. | Search, repository details and saved repositories. |
| Experienced developers | Discover projects and developers working in areas of interest. | Developer profiles, following features and public GitHub information. |
| Developers building an online presence | Present their work and make their contact information accessible. | Personal profiles, optional social links and GitHub integration. |

The design focuses on user needs rather than assumptions about age or background. The interface uses a simple visual foundation, light and dark themes, and light green accents to maintain a consistent appearance across the application.

## Core Features and Use Cases

| Feature | Use case | Intended benefit |
|---|---|---|
| Repository search and discovery | Visitors search for public GitHub repositories and browse the results. | Makes relevant projects easier to discover. |
| Repository details and contents | Visitors open a repository to inspect its available information and files. | Helps users understand a project before deciding to explore it further. |
| Registration and login | Users create a Clonvix account using an email address and password, then log in. | Enables access to account-specific features. |
| Saved repositories | Logged-in users save and remove repositories from their personal collection. | Makes useful projects easier to revisit. |
| Developer profiles | Visitors view profile information, follower and following counts, and optional social links. | Provides a central place to discover information about developers. |
| Following developers | Registered users follow or unfollow developers within Clonvix. | Supports developer discovery independently of GitHub's own following system. |
| GitHub integration | Users connect or disconnect their GitHub accounts. | Allows connected users to display their public GitHub profile, repositories and profile README. |
| Personal showcase and supporting pages | Visitors explore the ColmN-Dev showcase, About page or Contact page. | Presents the developer's work and provides relevant contact information. |
| Responsive design and themes | Users access the application on different screen sizes and choose light or dark mode. | Supports accessibility, consistency and ease of use. |

### Account and GitHub Integration

Clonvix accounts and GitHub accounts serve different purposes. Users register for Clonvix with an email address and password. Connecting GitHub is an additional feature, not a requirement for registration.

GitHub login is available only to existing Clonvix users who have already connected their GitHub account. It does not provide a separate registration method.

Similarly, saving repositories and following developers within Clonvix do not alter a user's GitHub stars or following list.

## Technology Stack and Rationale

The technology stack was selected to support a maintainable application, reliable data handling, integration with GitHub and straightforward deployment.

| Technology | Role in Clonvix | Rationale |
|---|---|---|
| React | Frontend interface | Supports reusable components and interactive pages. |
| TypeScript | Frontend development | Adds type checking to help catch errors and improve maintainability. |
| Django | Backend framework | Provides established tools for application logic, authentication and database interaction. |
| Django REST Framework | Backend API | Structures communication between the frontend and backend. |
| PostgreSQL | Application database | Stores structured data such as user accounts, saved repositories and following relationships. |
| GitHub REST API | External data integration | Provides access to public repository and developer information without duplicating GitHub's entire dataset. |
| Bootstrap and custom CSS | Interface styling | Support responsive layouts while allowing a consistent, customised visual design. |
| Resend | Email delivery | Supports application email workflows through an API. |
| Automated and manual testing | Quality assurance | Helps identify errors, prevent regressions and verify important user journeys. |
| Git and GitHub | Version control | Track changes and maintain the source code in a central repository. |
| Render and Neon | Production deployment and database hosting | Provide a hosted application environment and production PostgreSQL database. |

### Scalability and Maintainability

Separating the React frontend from the Django backend keeps the user interface and application logic distinct. TypeScript and reusable components help maintain the frontend, while Django REST Framework provides a structured API for communication between the two layers.

The trade-off is added complexity: the frontend and backend communicate through an API, which takes more setup than a single combined application.

PostgreSQL stores Clonvix's own application data, while GitHub remains the source of repository and developer information. API rate limits, request failures and appropriate caching must be considered to maintain reliable access as the application develops.

### Usability

Bootstrap provides a foundation for responsive layouts, with custom CSS supporting the Clonvix design. Consistent navigation, clear feature labels and light and dark themes help users interact with the application across different devices.

### Security

Django includes built-in protection against common web vulnerabilities such as cross-site scripting, cross-site request forgery and SQL injection, and stores passwords securely using hashing. Access tokens and other secrets will be kept in environment variables rather than in the code.

## Project Goals and Success Criteria

The project will be evaluated against practical criteria that demonstrate whether the application works as intended.

| Goal | Success criteria |
|---|---|
| Complete the agreed functionality | All agreed core features are implemented and checked against their requirements. |
| Support essential user journeys | Repository discovery, account access, saving repositories, following developers and GitHub connection are verified. |
| Maintain application reliability | All critical automated tests pass during final verification. |
| Provide a responsive interface | Main pages are checked at desktop and mobile widths, and significant layout issues are resolved. |
| Integrate with GitHub | Repository and developer information can be retrieved successfully, with appropriate handling of errors and API limitations. |
| Deploy successfully | The production application loads correctly and its main user journeys are verified after deployment. |
| Maintain project quality | Testing, implementation decisions, challenges, solutions and relevant design decisions are documented. |

These criteria provide observable evidence of completion without relying on user-engagement statistics that cannot yet be measured reliably.

## Initial Design and Wireframes

The initial wireframes were created in Lovable to explore the layout and structure of the main application screens before implementation.

### Homepage

![Clonvix homepage wireframe](/docs/wireframes/homepage.png)

The homepage establishes the application's identity and gives visitors a clear starting point for discovering repositories and developers.

### Search Results

![Clonvix search results wireframe](/docs/wireframes/search-results.png)

The search results screen focuses on presenting repository results clearly, allowing visitors to browse projects and identify ones worth exploring.

### Profile Page

![Clonvix profile page wireframe](/docs/wireframes/profile.png)

The profile page organises developer information into a clear layout, including profile details, social links and a separate GitHub Integration section. This keeps account connection controls distinct from other profile details.