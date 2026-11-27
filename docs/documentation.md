# Clonvix Documentation

**Last updated:** November 27, 2026

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Database](#5-database)
6. [Implemented Features](#6-implemented-features)
7. [Current Limitations](#7-current-limitations)
8. [Key Design Decisions](#8-key-design-decisions)
9. [Deployment](#9-deployment)
10. [Testing](#10-testing)
11. [Challenges and Solutions](#11-challenges-and-solutions)
12. [What Was Learned](#12-what-was-learned)
13. [References](#13-references)

---

## 1. Overview

Clonvix is a full-stack web application that combines a personal developer portfolio with a GitHub repository explorer. Its aim is to make it easier for users to discover software projects and developers, while providing registered users with features to manage their accounts and customise their developer profiles.

Visitors can search public GitHub repositories, topics and developers, and explore repository detail pages, topic pages and GitHub profile pages without creating an account. Registered users can create accounts, manage their profiles, update account details and securely manage their authentication credentials. Further functionality, including saved repositories, developer-following features and GitHub account integration, remains planned.

The project is developed using React and TypeScript on the frontend, with Django and Django REST Framework on the backend. PostgreSQL is used for persistent application data, while the GitHub REST API provides repository and developer information. Redis handles server-side caching, Cloudinary provides profile image storage, and Brevo handles transactional emails. The application is hosted on Render, with Neon providing the production PostgreSQL database.

The application includes repository, topic and developer discovery, repository detail pages, GitHub profile pages and trending repositories based on historical star growth. Authentication and account management are also implemented, including registration, login, profile editing, email verification, password recovery, account settings and account deletion. The application is deployed and accessible through its production environment.

## 2. Project Structure

The project is split into documentation, a Django backend and a Vite-powered React frontend. The tree below shows the key files and folders, and this structure can change as new features are added.

```text
Clonvix/
├── .github/
│   └── workflows/
│       ├── project-checks.yml
│       └── trending-snapshots.yml
├── README.md
├── build.sh
├── dev.ps1
├── dev.sh
├── docs/
│   ├── documentation.md
│   ├── project-plan.md
│   ├── clonvix-erd.dbml
│   ├── images/
│   ├── presentations/
│   └── wireframes/
└── src/
    ├── backend/
    │   ├── manage.py
    │   ├── requirements.txt
    │   ├── accounts/
    │   ├── config/
    │   └── github/
    │       └── management/
    │           └── commands/
    └── frontend/
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── public/
        └── src/
            ├── assets/
            ├── components/
            ├── pages/
            ├── types/
            ├── utils/
            ├── App.tsx
            ├── index.css
            └── main.tsx
```

The `docs` directory contains the project plan, presentations, user-flow and site-map images, wireframes and database design. The `build.sh` script at the project root is run by Render during each deployment. The `dev.sh` and `dev.ps1` scripts at the project root start local development with one command, running the Django development server, the Vite development server and both snapshot management commands.

The `src/backend` directory contains the Django project, the `accounts` app for user-related functionality and the `github` app for GitHub API integration, including repository, topic and user search. The `accounts` app handles authentication, user profiles, account settings and email-related functionality. Its `signals.py` file registers the profile creation signal, which automatically creates a profile when a new user is created. Custom Django management commands are organised within `github/management/commands/`.

The `src/frontend` directory contains the React application, with `App.tsx` handling the main application routes and `main.tsx` serving as the entry point. Shared styling is maintained in `index.css`, while reusable components are organised in `components` and routed screens in `pages`. Vite and TypeScript configuration files are located at the frontend root. Shared TypeScript interfaces are kept in `types` and helper functions such as the relative time formatter are kept in `utils`.

## 3. Backend

The backend is a Django project located in `src/backend`, using Django REST Framework to expose JSON APIs to the frontend. It is organised into two main apps: `accounts`, which handles user authentication, profiles and account management, and `github`, which handles integration with the GitHub REST API.

The `accounts` app uses a custom Django user model with email and username fields. It handles registration, login, session-based authentication, profile creation and editing, account settings, email verification, password recovery and account deletion. A `post_save` signal automatically creates a profile whenever a new user is registered. Transactional emails are sent through the Brevo API, while Cloudinary handles profile image storage.

The backend provides a health/status endpoint at `GET /api/status/` and the Django admin interface at `/admin/`. A catch-all route in `config/urls.py` serves the built React application for frontend routes, allowing pages to work when refreshed. API, admin and static URLs are excluded from this route.

The backend settings use environment variables for configuration. PostgreSQL is configured through `DATABASE_URL`, with `dj-database-url` handling the connection. `python-dotenv` loads local environment variables, Redis provides server-side caching, and WhiteNoise serves the built frontend files in production. CORS is configured for the local Vite development server, while Django's authentication, session and security middleware handle requests.

The GitHub API token is stored in an environment variable and is never exposed to the frontend. Separate read-only tokens are used for local development and production to access public repository and developer information.

The `github` app handles repository, topic and user searches through `GET /api/github/search/`. Repository searches support language filtering, sorting and pagination, while topic and user searches use their respective GitHub API endpoints. Repository detail endpoints provide information including releases, deployments, contributors, languages, commit counts, branches, tags, latest commits, file contents and README data.

GitHub API requests are separated into `github_client.py`, while `services.py` handles application logic and Redis caching. Views process incoming requests, and `urls.py` defines the API routes. Cached responses reduce repeated GitHub requests and help manage API rate limits.

Trending repositories are calculated using daily star-count snapshots stored in PostgreSQL. The `RepositorySnapshot` model records repository IDs, star counts and snapshot dates, with a unique constraint preventing duplicate daily records. A custom Django management command collects snapshots, while the Trending service calculates daily, weekly and monthly star growth. Results are provided through `GET /api/github/trending/` and cached using Redis.

GitHub developer and organisation profiles are supported through endpoints under `/api/github/users/<username>/`. These provide profile information, social links, public repositories, followers and following lists. Profile README content is also retrieved, with separate handling for user and organisation README locations. A `ThreadPoolExecutor` is used to retrieve follower and following profiles concurrently, reducing loading times.

The `project-checks.yml` GitHub Actions workflow runs Django checks and backend tests, followed by frontend linting and production build checks. The separate `trending-snapshots.yml` workflow runs daily to collect repository snapshots in production.

## 4. Frontend

The frontend is a React application written in TypeScript and built with Vite. The entry point renders the `App` component, which uses React Router to handle navigation between the Home, About, ColmN-Dev, Contact, Topic, Repository Detail, GitHub Profile, Search and Search Results pages, alongside authentication and account management pages.

The layout is built from reusable components. `Header` contains the Clonvix logo, navigation links and theme toggle, while `Footer` contains the brand and explore links. On smaller screens, the navigation collapses into a hamburger menu with a slide-out panel and overlay. Icons are provided by `lucide-react`.

The theme toggle offers System, Light and Dark options. Preferences are saved in `localStorage` and applied through a `data-theme` attribute on the HTML element, with System mode following the operating system's colour preference.

Tailwind CSS v4 is configured through the Vite plugin, alongside a custom stylesheet in `src/frontend/src/index.css`. The stylesheet defines the Clonvix visual design, including Inter and Sora typography, shared colour variables, light and dark themes, responsive layouts, navigation styles and keyboard focus indicators.

The Search Results page supports repository, topic and user searches through the Django API. Repository results include owner information, descriptions, programming languages, topics and star counts, with filtering, sorting and pagination. Topic and user results have their own layouts, and search options are reflected in URL parameters so results can be shared or revisited.

The Repository Detail page displays repository information, including its owner, statistics, file tree and rendered README. A sidebar provides the description, homepage, topics, latest release, latest deployment, contributors and language breakdown. The file tree displays up to 25 root-level items with their latest commit information, while links provide access to the full repository on GitHub.

README content is rendered using `react-markdown`, with `rehype-raw`, `rehype-sanitize` and `rehype-slug` providing HTML support, sanitisation and heading links. Repository language statistics are calculated from the language data returned by GitHub.

Topic pages display repositories matching a selected topic, with pagination. The GitHub Profile page uses a shared layout for developers and organisations, displaying profile information, social links, README content, repositories and followers or following lists. Repository listings support sorting, while follower and following lists use pagination and URL parameters.

The Home page contains a hero section and a Trending repositories section, displaying repositories ranked by historical star growth across daily, weekly and monthly periods.

Authentication and account management are handled through the frontend's shared authentication state. Registration, login and logout update the application state, while protected routes restrict access to authenticated users. Users can access their profile, edit profile information and manage account settings, including username, email and password changes. Additional functionality includes email verification, password recovery and account deletion.

Profile editing supports display name, biography, location, website, social links and profile image uploads. Profile images are uploaded through the backend and stored using Cloudinary.

The application uses shared loading states, reusable components and TypeScript interfaces to keep data handling consistent across pages. API requests use loading and error handling, with `AbortController` used where necessary to cancel outdated requests.

## 5. Database

PostgreSQL is the persistent database for Clonvix, hosted on Neon. Django's ORM is used to create and interact with database models. The database is intended to store Clonvix-specific data, while current GitHub repository and developer information is normally retrieved from the GitHub REST API and cached for short periods.

The ERD in [`clonvix-erd.dbml`](./clonvix-erd.dbml) describes the following tables:

| Table | Purpose |
|---|---|
| `user` | Stores email-based Clonvix accounts, usernames and Django authentication fields. |
| `profile` | Stores optional profile information such as display name, biography, profile image, location and social links. |
| `username_change_log` | Keeps previous usernames so that old profile URLs can continue to be resolved. |
| `github_connection` | Links a Clonvix account to a connected GitHub account using its stable GitHub ID. |
| `saved_repository` | Stores a user's saved repositories and a snapshot of relevant repository details. |
| `follow` | Stores relationships where one Clonvix user follows another Clonvix user. |
| `github_follow` | Stores relationships where a Clonvix user follows a GitHub developer, including developers without Clonvix accounts. |
| `repository_snapshot` | Stores daily snapshots of GitHub repository star counts, using the GitHub repository ID and snapshot date. |

The design deliberately keeps Clonvix relationships separate from GitHub relationships. Saving a repository will not star it on GitHub, and following a GitHub developer will not require that developer to register with Clonvix. Unique constraints in the design prevent duplicate saved repositories and duplicate follow relationships for the same user pair.

The `user`, `profile` and `username_change_log` tables are implemented through the custom Django models. The `repository_snapshot` table is also implemented and stores the GitHub repository ID, star count and snapshot date. A unique constraint on the repository ID and snapshot date prevents duplicate daily snapshots for the same repository.

The remaining tables are currently part of the database design rather than completed Django models and migrations. The ERD will be reviewed against implemented features as development continues, with schema changes reflected in both the models and this documentation.

## 6. Implemented Features

- **Full-stack architecture:** Django REST Framework backend with a React, TypeScript and Vite frontend.
- **Responsive design:** Navigation, layouts and components adapted for desktop, tablet and mobile screens.
- **Theme system:** System, Light and Dark themes with saved preferences.
- **GitHub integration:** Repository, topic and developer searches through the GitHub REST API.
- **Repository discovery:** Search filtering, sorting, pagination and detailed repository pages.
- **Topic exploration:** Dedicated topic pages with repository listings.
- **GitHub profiles:** Developer and organisation profiles with social links, README previews, repositories, followers and following.
- **Trending repositories:** Daily, weekly and monthly star-growth rankings using historical repository snapshots.
- **Authentication:** User registration, login, logout and protected routes.
- **Profile management:** Profile editing, image uploads, username changes and account settings.
- **Account security:** Email verification, password changes, password recovery and account deletion.
- **Database and caching:** Neon PostgreSQL for persistent data and Redis for GitHub API caching.
- **Email and image services:** Brevo transactional emails and Cloudinary image storage.
- **Automated testing:** Django backend tests and GitHub Actions workflows for backend and frontend checks.
- **Deployment:** Render deployment with Django serving the built React application through WhiteNoise.
- **Local development:** PowerShell and shell scripts for starting the development environment.
- **Documentation and version control:** Project documentation, database ERD, Git tags and GitHub Releases.

### Planned Features

- Saved repositories and developer-following features.
- GitHub account connection and OAuth authentication.
- Clonvix developer profiles.

## 7. Current Limitations

Clonvix relies on the GitHub REST API to retrieve public repository and developer information. This introduces some limitations outside the application's direct control:

- **GitHub stargazer access:** Clonvix can display repository star counts but cannot retrieve public stargazer lists for repositories where it does not have administrative or collaborator access.

- **GitHub API rate limits:** GitHub limits the number of API requests within a given period. Authentication and Redis caching help reduce requests, but high usage can still result in rate-limit restrictions.

- **Topic search data:** GitHub's topic search API provides limited information, including no related topics or comprehensive repository counts.

- **Public repository access:** The current integration retrieves publicly accessible repository information. Private repository access requires additional permissions and GitHub authentication.

- **External API availability:** Changes to the GitHub API, service interruptions or failed requests can affect repository, topic and developer discovery.

- **Historical trending data:** GitHub does not provide historical daily star counts through its standard search API. Clonvix collects its own snapshots, so historical comparisons depend on the data available and retained.

- **Repository detail limitations:** Commit, branch and tag totals are derived from pagination data, with commit counts covering the default branch only. The file tree displays a maximum of 25 root-level items, with further navigation handled through GitHub.

- **GitHub profile limitations:** Profile pages display up to ten repositories from the 100 most recently updated public repositories. Sorting by stars or name is therefore limited to those results. Social links also use generic icons when a matching platform icon is unavailable.

- **Followers and following performance:** Each account requires an individual GitHub API request. Concurrent requests reduce loading times, but uncached pages still take approximately five seconds to load.

## 8. Key Design Decisions

**React and TypeScript.** Neither technology was required by the project brief. Both were chosen to build on existing knowledge and gain experience with tools used in professional software development.

**Separate frontend and backend in development, one service in production.** React and Django communicate through a JSON API during development. In production, Django serves the built React application through a single Render service, avoiding the need to deploy and maintain separate services.

**Tailwind CSS with a custom stylesheet.** Tailwind CSS v4 is used alongside custom CSS in `index.css`. This provides utility-based styling while allowing shared themes, variables and component styles to be maintained separately.

**Solid colours instead of glassmorphism.** Clonvix uses solid backgrounds and cards rather than the glassmorphism style used in previous projects. The light and dark themes use different green accents to maintain contrast and readability.

**Theme toggle with System, Light and Dark.** Users can follow their operating system preference or manually select a theme. Preferences are stored in `localStorage` and applied through a `data-theme` attribute.

**Separate Django apps for accounts and GitHub integration.** The `accounts` app handles authentication, profiles and account management, while the `github` app handles GitHub API integration. This keeps unrelated functionality separate and makes the backend easier to maintain.

**Custom user model and session-based authentication.** A custom Django user model was introduced to support email and username-based accounts. Session authentication was chosen to manage logged-in users and protect account-related functionality.

**Server-side GitHub tokens for public data.** GitHub requests use fine-grained personal access tokens with read-only access to public repositories. Separate tokens are maintained for development and production, and neither is exposed to the frontend.

**Backend handling of repository filtering and sorting.** Filtering and sorting are handled through Django and GitHub API parameters before pagination. This ensures results are processed across the matching result set rather than only the currently loaded page.

**Clonvix relationships kept separate from GitHub.** Saving repositories and following developers will be handled independently within Clonvix. These actions will not modify a user's GitHub activity or require developers to have Clonvix accounts.

**GitHub data fetched rather than permanently stored.** Repository, topic and developer information is retrieved from the GitHub REST API and cached temporarily using Redis. Clonvix stores its own application data and historical repository snapshots rather than maintaining unnecessary copies of GitHub data.

**Historical repository snapshots.** GitHub does not provide historical daily star counts through its standard search API. The `RepositorySnapshot` model stores daily star counts, allowing Clonvix to calculate historical repository growth.

**Linking to GitHub for secondary views.** Folder navigation, file viewing, activity and other secondary repository information link to GitHub rather than being fully recreated within Clonvix. This keeps development focused on the main repository discovery experience.

**Sanitised markdown.** README content comes from external repositories, so HTML is sanitised before rendering to prevent unsafe content from being displayed.

**One profile page for users and organisations.** Both GitHub account types share the same layout, with conditional rendering for fields that are only available to users or organisations.

**Concurrent follower and following requests.** GitHub follower and following lists require additional profile requests for each account. A `ThreadPoolExecutor` was introduced to process these requests concurrently and reduce loading times.

**One command for local development.** The `dev.sh` and `dev.ps1` scripts start the Django server, Vite development server and snapshot commands together, simplifying local development across different operating systems.

**Render and Neon for deployment.** Render hosts the application, while Neon provides the PostgreSQL database. Keeping the frontend and backend within one Render service simplifies deployment while allowing the database to be managed separately.

## 9. Deployment

Clonvix is deployed on Render as a single web service at [clonvix.onrender.com](https://clonvix.onrender.com), with the PostgreSQL database hosted on Neon. Django serves the built React application, so the frontend and backend share one address in production.

Render uses the following commands:

- **Build command:** `bash build.sh`
- **Start command:** `cd src/backend && gunicorn config.wsgi:application`

The `build.sh` script runs during each deployment and performs the following steps in order:

1. Installs the frontend dependencies and builds the React application with `npm run build`, creating the `dist` folder.
2. Installs the Python dependencies from `requirements.txt`.
3. Runs `collectstatic`, which copies the built frontend files into `staticfiles`.
4. Runs the database migrations.

Gunicorn runs Django instead of the development server, while WhiteNoise serves the collected static files to the browser. Several settings need to work together for this deployment setup:

- `base: '/static/'` in `vite.config.ts` makes the built `index.html` request its scripts and styles from `/static/`, where WhiteNoise serves them.
- `STATICFILES_DIRS` in `settings.py` points to the frontend `dist` folder, allowing `collectstatic` to collect the built files.
- The `dist` folder is also configured as a Django template directory so Django can return `index.html`.
- The catch-all route in `config/urls.py` returns `index.html` for frontend routes, allowing React Router pages to work when refreshed.

Environment variables are configured through the Render dashboard and are not committed to the repository:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key for production |
| `DATABASE_URL` | Neon PostgreSQL connection string, including `sslmode=require` |
| `DEBUG` | Controls Django debug mode; set to `False` in production |
| `GITHUB_API_TOKEN` | GitHub API token for accessing public repository, topic and user data |
| `REDIS_URL` | Upstash Redis connection URL used for server-side caching |
| `BREVO_API_KEY` | API key used to authenticate requests to Brevo for transactional email delivery |
| `CLOUDINARY_URL` | Cloudinary connection URL used for image storage and delivery |
| `BREVO_SENDER_EMAIL` | Verified sender email address used for Brevo transactional emails |
| `FRONTEND_URL` | Frontend application URL used to generate email verification and password-reset links |

**Redis is provided locally through Layerbase during development and through Upstash in production.**

The deployed hostname is included in `ALLOWED_HOSTS`. Because the frontend and backend share one origin in production, CORS is only required during local development, where the Vite development server runs on a different port.

The GitHub API tokens have an expiry period, so an expired token is one of the first things to check if GitHub requests begin failing with authentication errors.

## 10. Testing

### Manual Testing

Manual testing was carried out throughout development to verify individual features, API responses and the overall application.

- **Code and configuration checks:** Ran `npm run lint`, `npm run build` and `python manage.py check` to identify frontend and backend issues.
- **Repository and topic search:** Tested different queries, language filters, sorting options and pagination.
- **Trending:** Tested daily, weekly and monthly rankings, and verified that the snapshot management command stored daily records correctly.
- **API validation:** Tested missing and invalid parameters to check error handling.
- **Responsive design:** Checked layouts using browser resizing and device emulation, including mobile navigation, overlays, scrolling and theme menus.
- **Themes and search:** Tested System, Light and Dark themes, along with search modes and available filters.
- **Repository and GitHub profiles:** Compared repository details against GitHub and tested developer and organisation profiles, including accounts with missing information.
- **Followers and following:** Tested pagination, loading performance and invalid page numbers.
- **Authentication and account management:** Tested registration, login, logout, protected routes, profile editing, image uploads, username and email changes, email verification, password changes, password recovery and account deletion.
- **Deployment:** Checked the live Render application after deployments.

### Automated Testing

The backend includes 33 unit tests covering account functionality, API views and related behaviour. These tests are run alongside Django system checks through the `project-checks.yml` GitHub Actions workflow.

The workflow also runs frontend linting and a production build check on pushes and pull requests targeting `main`.

## 11. Challenges and Solutions

- **Connecting the frontend and backend:** `django-cors-headers` was configured to allow requests from the local React development server. A status endpoint was created to verify the connection, while production uses a shared origin through Django.

- **Serving React through Django:** WhiteNoise, Vite's `base` path, `STATICFILES_DIRS` and Django's template directory were configured to serve the built React application. A build script and catch-all route support production deployment and direct page refreshes.

- **Integrating and managing the GitHub API:** API requests and application logic were separated into client and service layers. Separate read-only tokens are used for development and production, while Redis caching reduces repeated requests and helps manage rate limits.

- **Managing different search categories:** Repository, topic and user searches return different response structures and support different options. Category-specific handling was implemented to display the correct information and prevent unrelated filters from carrying over.

- **Synchronising search and pagination with the URL:** Search queries, categories, filters, sorting and pagination were connected to URL parameters. Pagination resets when search options change, while invalid page numbers are redirected to a valid page.

- **Moving repository sorting to the backend:** Frontend sorting initially only affected repositories on the current page. Sorting was moved to Django, where parameters are passed to GitHub's API before pagination.

- **Synchronising the theme and mobile navigation:** `prefers-color-scheme` allows the application to follow operating system preferences, while `data-theme` applies manual selections. The mobile menu's `z-index` values were adjusted to keep the theme dropdown visible above the menu and overlay, with scrolling and spacing improved for shorter screens.

- **Handling GitHub API limitations:** GitHub restricts access to public stargazer lists for repositories where the authenticated user is not an administrator or collaborator. Clonvix therefore displays repository star counts without individual stargazer lists.

- **Developing historical repository trending:** GitHub's standard search API does not provide historical daily star counts. A `RepositorySnapshot` model was created to store repository IDs, star counts and snapshot dates. A management command collects snapshots, allowing daily, weekly and monthly star growth to be calculated.

- **Retrieving repository information:** GitHub does not provide a direct total commit count. Requests were configured to retrieve one commit per page, allowing the last page number in the `Link` header to be used as the total. File tree commit information also required individual requests, so the tree was limited to 25 items and responses were cached for ten minutes.

- **Displaying accurate repository activity:** GitHub's `updated_at` field was replaced with `pushed_at` on repository cards so the displayed date reflects the last code push. Topic images were also handled separately because the topic search endpoint does not provide image URLs; paths are constructed using GitHub's public Explore repository, with an error handler for unavailable images.

- **Rendering repository READMEs safely:** README files contain Markdown and potentially untrusted HTML. `rehype-raw`, `rehype-sanitize` and `rehype-slug` were combined to support HTML, sanitise content and generate heading links.

- **Displaying GitHub social links:** GitHub returns a provider and URL for social links, but some platforms are returned as `generic`. The `simple-icons` package and a lookup object provide platform icons where available. Generic providers are identified using the URL's domain, with a standard link icon used as a fallback.

- **Retrieving organisation profile READMEs:** User profile READMEs are stored in repositories named after their usernames, while organisation READMEs use `profile/README.md` in the `.github` repository. The README function was extended with an optional path parameter to support both locations.

- **Improving followers and following performance:** GitHub only returns usernames and avatars in its follower and following lists, requiring an additional profile request for each account. Sequential requests took approximately 15–20 seconds per page. A `ThreadPoolExecutor` with ten workers now processes up to 20 lookups concurrently, reducing uncached loading times to approximately five seconds.

- **Formatting large counts and invalid pagination values:** Large counts wrapped onto multiple lines in the sidebar, so a shared `formatCount` helper uses `Intl.NumberFormat` with compact notation. Pagination was also updated to handle invalid, negative and out-of-range page numbers.

- **Creating profiles for existing production accounts:** A `post_save` signal was implemented to automatically create a profile whenever a new user registers. Existing production accounts had been created before the signal was introduced, so their profiles had to be created separately during deployment.

- **Testing profile image uploads:** The image upload test initially failed because the multipart request was not encoded correctly. The test was updated to use the correct multipart request format and a valid PNG image generated with Pillow.

- **Handling account deletion and navigation:** Deleting an account cleared the global authentication state while the user was still on a protected account settings route, causing an unwanted redirect to the login page. Navigation was moved to the homepage before clearing the authentication state, allowing the success notification to display correctly.

- **Configuring Brevo API permissions and IP restrictions:** Initial email requests failed because the Brevo API keys only had read access instead of the permissions required to send transactional emails. The API key permissions were updated to allow email sending, and Brevo's IP restriction setting, which was blocking unauthorised addresses, was disabled. This resolved local email delivery issues, allowing the Django backend to send transactional emails through Brevo's HTTPS API.

- **Implementing email verification and password recovery:** Email changes and password recovery required secure links between the Django backend and React frontend. Django signing was used to generate time-limited tokens, while Brevo handles transactional email delivery.

- **Managing profile and account updates:** Account functionality introduced additional validation requirements, including username availability, email uniqueness, password confirmation and current-password verification. These checks were handled by the backend to ensure account changes were validated before being saved.

## 12. What Was Learned

Developing Clonvix provided practical experience building a full-stack application using Django, Django REST Framework, React and TypeScript. It built on previous experience with Flask and introduced a more structured backend architecture through separate Django applications, API endpoints, models and service layers. It also strengthened understanding of how frontend, backend, databases and external services work together.

Frontend development involved learning React and TypeScript in greater depth, including reusable components, props, interfaces, hooks, React Router and Tailwind CSS. Managing application state, asynchronous requests, URL parameters, responsive layouts and multiple themes provided further experience building a larger frontend application.

Backend development introduced Django's authentication system, session management, CSRF protection, signals and database migrations. Implementing registration, login, profile management, email verification, password recovery and account deletion provided practical experience handling user accounts and protecting sensitive operations.

External API integration provided experience working with authentication, permissions, rate limits, response handling and caching. The GitHub REST API introduced challenges around retrieving and processing large amounts of external data, while Brevo and Cloudinary provided experience integrating transactional email and image storage services.

Database development involved PostgreSQL, Django models, relationships and migrations. Implementing historical repository snapshots also introduced scheduled data collection and processing, allowing repository star growth to be compared over time.

Testing and automation strengthened experience writing backend unit tests and implementing continuous integration through GitHub Actions. Automated checks helped identify issues across the backend and frontend before changes were deployed.

Deployment provided practical experience with Render, Neon PostgreSQL, Gunicorn, WhiteNoise and production environment configuration. It highlighted the differences between local development and production, particularly when serving a built React application through Django and configuring external services.

Version control and project management skills developed through Git commits, tags, releases and technical documentation. Working through development milestones also reinforced the importance of planning features, managing scope and prioritising functionality within a limited timeframe.

Overall, Clonvix brought together frontend development, backend architecture, authentication, database management, external API integration, automated testing and deployment. It strengthened the ability to understand, develop, debug and maintain a complete full-stack application.

## 13. References

### Project and source control
- [Clonvix GitHub repository](https://github.com/ColmN-Dev/Clonvix)
- [Git documentation](https://git-scm.com/doc)
- [GitHub Actions documentation](https://docs.github.com/en/actions)

### Frontend
- [React documentation](https://react.dev/)
- [React Router documentation](https://reactrouter.com/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [HTML documentation](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Intl.NumberFormat documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Vite documentation](https://vite.dev/guide/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Lucide React documentation](https://lucide.dev/guide/packages/lucide-react)
- [Simple Icons documentation](https://github.com/simple-icons/simple-icons)
- [react-markdown documentation](https://github.com/remarkjs/react-markdown)
- [rehype-raw documentation](https://github.com/rehypejs/rehype-raw)
- [rehype-sanitize documentation](https://github.com/rehypejs/rehype-sanitize)
- [rehype-slug documentation](https://github.com/rehypejs/rehype-slug)

### Backend and API
- [Python documentation](https://docs.python.org/3/)
- [Python concurrent.futures documentation](https://docs.python.org/3/library/concurrent.futures.html)
- [Django documentation](https://docs.djangoproject.com/)
- [Django custom authentication documentation](https://docs.djangoproject.com/en/6.1/topics/auth/customizing/)
- [Django session documentation](https://docs.djangoproject.com/en/6.1/topics/http/sessions/)
- [Django CSRF documentation](https://docs.djangoproject.com/en/6.1/ref/csrf/)
- [Django cryptographic signing documentation](https://docs.djangoproject.com/en/6.1/topics/signing/)
- [Django signals documentation](https://docs.djangoproject.com/en/6.1/topics/signals/)
- [Django password management documentation](https://docs.djangoproject.com/en/6.1/topics/auth/passwords/)
- [Django testing documentation](https://docs.djangoproject.com/en/6.1/topics/testing/)
- [Django admin site documentation](https://docs.djangoproject.com/en/6.1/ref/contrib/admin/)
- [Django model forms documentation](https://docs.djangoproject.com/en/6.1/topics/forms/modelforms/)
- [Django static files documentation](https://docs.djangoproject.com/en/6.1/howto/static-files/)
- [Django REST Framework documentation](https://www.django-rest-framework.org/)
- [django-cors-headers documentation](https://github.com/adamchainz/django-cors-headers)
- [Gunicorn documentation](https://docs.gunicorn.org/en/stable/)
- [WhiteNoise documentation](https://whitenoise.readthedocs.io/)
- [python-dotenv documentation](https://bbc2.github.io/python-dotenv/)
- [dj-database-url documentation](https://github.com/jazzband/dj-database-url)

### Database
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Neon documentation](https://neon.tech/docs)
- [dbdiagram.io documentation](https://dbdiagram.io/docs)

### External services
- [GitHub REST API documentation](https://docs.github.com/en/rest)
- [GitHub REST API pagination documentation](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api)
- [GitHub REST API followers documentation](https://docs.github.com/en/rest/users/followers)
- [GitHub REST API social accounts documentation](https://docs.github.com/en/rest/users/social-accounts)
- [GitHub REST API repository contents documentation](https://docs.github.com/en/rest/repos/contents)
- [GitHub personal access tokens documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Apps documentation](https://docs.github.com/en/apps)
- [Cloudinary documentation](https://cloudinary.com/documentation)
- [Brevo API documentation](https://developers.brevo.com/)
- [Redis documentation](https://redis.io/docs/)
- [Upstash documentation](https://upstash.com/docs)
- [Layerbase documentation](https://layerbase.com/docs)

### Hosting and deployment
- [Render documentation](https://render.com/docs)
- [Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)