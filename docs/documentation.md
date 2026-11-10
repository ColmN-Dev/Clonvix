# Clonvix Documentation

**Last updated:** November 10, 2026

---

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

Clonvix is a full-stack web application that combines a personal developer portfolio with a GitHub repository explorer. Its aim is to make it easier for users to discover software projects and developers, while providing registered users with features to save repositories, follow developers and manage a developer profile.

Visitors can search public GitHub repositories and explore search results without creating an account. Additional functionality, including detailed repository views, repository contents and developer profiles, is planned. Authenticated users will have access to features such as saved repositories, following relationships and profile management. Users will also be able to connect their GitHub accounts to display their public repositories and support GitHub-based authentication.

The project is being developed using React and TypeScript on the frontend, with Django and Django REST Framework on the backend. PostgreSQL is used for persistent application data, while the GitHub REST API provides repository and developer information. The application is hosted on Render, with Neon providing the production PostgreSQL database.

The project currently has a working foundation, including custom user model configuration, frontend routing, responsive layouts, light and dark themes, and a live production deployment. The `github` app handles GitHub API integration and currently supports repository, user and topic searches, server-side caching, language filtering, sorting, pagination and trending repositories based on historical star growth. Further functionality, including repository detail pages, authentication, account features and GitHub account integration, remains planned.

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
            ├── App.tsx
            ├── index.css
            └── main.tsx
```

The `docs` directory contains the project plan, presentations, user-flow and site-map images, wireframes and database design. The `build.sh` script at the project root is run by Render during each deployment. The `src/backend` directory contains the Django project, the `accounts` app for user-related functionality and the `github` app for GitHub API integration, including repository, topic and user search. Custom Django management commands are organised within `github/management/commands/`.

The `src/frontend` directory contains the React application, with `App.tsx` handling the main application routes and `main.tsx` serving as the entry point. Shared styling is maintained in `index.css`, while reusable components are organised in `components` and routed screens in `pages`. Vite and TypeScript configuration files are located at the frontend root.

## 3. Backend

The backend is a Django project located in `src/backend`. Django REST Framework is included in the project dependencies to expose JSON APIs to the frontend. The `accounts` app handles user-related functionality, including the custom user model, while the `github` app handles integration with the GitHub REST API. GitHub API requests are handled separately from the views, with service logic and server-side caching managed through the service layer.

The backend currently provides a health/status endpoint at `GET /api/status/`, which returns a JSON response used to confirm communication between the frontend and backend. The Django admin route is configured at `/admin/`. A catch-all route at the end of `config/urls.py` returns the built React `index.html` for frontend routes such as `/about`, allowing them to work when refreshed. It skips URLs starting with `api/`, `admin/` and `static/`, and must remain last in the URL configuration.

The custom user model is configured with email and username fields and is registered in the Django admin panel. Registration, login, profiles and authentication endpoints are still to be developed.

The backend settings provide an environment-aware setup:

- PostgreSQL is configured through `DATABASE_URL`, with `dj-database-url` handling the connection settings.
- Environment variables are loaded with `python-dotenv`.
- WhiteNoise serves the built frontend files in production. `STATIC_ROOT` is `staticfiles`, `STATICFILES_DIRS` points at the frontend `dist` folder, and Django's template directory points at `dist` so `index.html` can be found.
- CORS is configured for the local Vite development origins.
- The deployed Render hostname is included in `ALLOWED_HOSTS`.
- Django's standard authentication, sessions and security middleware are enabled.

The GitHub API token is a fine-grained personal access token with read-only access to public repositories. Separate tokens are used for local development and production, so one can be revoked without affecting the other. The token is stored in an environment variable and is not exposed to the frontend.

The `github` app currently handles repository, user and topic searches through the GitHub REST API. The main API endpoint is `GET /api/github/search/`, which accepts a search query and additional parameters depending on the search type. Repository searches support language filtering, sorting and pagination. Sorting and filtering are handled through the backend and GitHub API parameters before pagination, ensuring results are processed across the full matching result set rather than only the currently loaded page. Topic searches use the GitHub topic search endpoint, while user searches retrieve matching GitHub developer accounts.

GitHub API requests are separated into `github_client.py`, while `services.py` handles the service logic and server-side caching. Redis is used to cache GitHub search responses and Trending results. The views in `views.py` process incoming requests, and `urls.py` defines the app's API routes.

Repository trending is implemented using daily star snapshots stored in PostgreSQL. The `RepositorySnapshot` model records repository information and its star count for each snapshot date, with a unique constraint preventing duplicate daily snapshots for the same repository. A custom Django management command, located in `github/management/commands/`, collects these snapshots. The Trending service compares historical snapshots to calculate star growth across daily, weekly and monthly periods. The endpoint `GET /api/github/trending/` provides the results, with Redis caching used to reduce repeated processing.

The `project-checks.yml` GitHub Actions workflow runs Django checks and backend tests, then lints and builds the frontend. The separate `trending-snapshots.yml` workflow can be dispatched manually and runs daily on a schedule to collect repository snapshots in production using the management command.

Repository detail pages, developer profiles and further authenticated functionality remain to be implemented.

## 4. Frontend

The frontend is a React application written in TypeScript and built with Vite. The entry point renders the `App` component, which uses React Router to handle navigation between the Home, About, ColmN-Dev, Contact and Search Results pages. The ColmN-Dev, About and Contact pages are placeholders for now.

The layout is built from separate components. `Header` contains the Clonvix logo and title, the `Nav` links and the `ThemeToggle`. `Footer` contains the brand, explore links and a GitHub link. On screens below 1050px, the navigation links collapse into a hamburger button that opens a slide-out menu with a dark overlay. The button switches between a menu and close icon, and the menu closes when the overlay or a link is clicked. Icons come from [`lucide-react`](https://lucide.dev/icons/).

The theme toggle offers System, Light and Dark. The choice is saved in `localStorage` and applied by setting a `data-theme` attribute on the `<html>` element. In System mode, the attribute is removed and the CSS follows the operating system through `prefers-color-scheme`.

Tailwind CSS v4 is configured through the Vite plugin, alongside a custom stylesheet in `src/frontend/src/index.css`. The stylesheet holds the Clonvix visual language and responsive rules, including:

- Inter and Sora typography.
- Light and dark colour themes, with a darker green accent in light mode and a lime accent in dark mode.
- Shared background, text, border and card colour variables.
- Header, navigation, theme toggle and footer styles.
- The hamburger menu and responsive breakpoints for screens below 1050px, tablets, small phones and landscape phones.
- Basic `focus-visible` styling for keyboard accessibility.
- Custom text selection colours that follow the active theme.

The Search Results page supports repository, topic and user searches through the Django API. Repository results include information such as the repository name, owner, description, programming language, topics and star count. Repository searches support language filtering, sorting and pagination. Topic searches display topic information and available images, while user searches display matching GitHub developer accounts. Search options and filters are reflected in the URL query parameters, allowing search results to be shared or revisited.

The Home page contains a hero section with a Clonvix background image and introductory content. It also includes a Trending repositories section, displaying repositories ranked by historical star growth across daily, weekly and monthly periods.

The application uses a shared full-screen loading overlay. It is controlled at the application level and is used while the Home page loads Trending data, while repository search requests run, and while search queries or filters change.

Other planned features include repository detail pages, saved repositories, developer profiles, profile editing, account settings and the ColmN-Dev showcase.

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

The `user` table is implemented through the custom Django user model. The `repository_snapshot` table is also implemented and stores the GitHub repository ID, star count and snapshot date. A unique constraint on the repository ID and snapshot date prevents duplicate daily snapshots for the same repository.

The remaining tables are currently part of the database design rather than completed Django models and migrations. The ERD will be reviewed against implemented features as development continues, with schema changes reflected in both the models and this documentation.

## 6. Implemented Features

The following parts of Clonvix are in place at this stage:

- A Django backend with Django REST Framework.
- A React, TypeScript and Vite frontend, deployed on Render.
- A custom Django user model configuration registered in the Django admin.
- React Router with Home, About, ColmN-Dev, Contact and Search Results pages.
- A responsive header and footer, with a slide-out hamburger menu on smaller screens.
- A System, Light and Dark theme toggle, with the preference saved between visits.
- Custom text selection colours that adapt to the active theme.
- A status endpoint at `GET /api/status/`.
- GitHub repository, topic and user search through the GitHub REST API.
- Server-side Redis caching for GitHub search responses and Trending results.
- Repository language filtering, sorting and pagination.
- URL query parameters for search queries, categories, filters and sorting options.
- Repository result cards displaying owner information, descriptions, programming languages, topics and star counts.
- Topic result cards displaying topic information and available images.
- User search results displaying matching GitHub developer accounts.
- Environment-based configuration for the secret key, debug mode, database connection, Redis and GitHub API token.
- A single-service deployment where Django serves the built React app through WhiteNoise, with a build script that runs on every deployment.
- A dedicated `github` Django app for GitHub API integration, separate from the `accounts` app.
- Tailwind CSS v4 configured through the Vite plugin, with shared theme colour variables in `index.css`.
- A PostgreSQL database hosted on Neon.
- A `RepositorySnapshot` model for storing daily GitHub repository star counts.
- A custom Django management command for collecting repository snapshots.
- Trending repositories ranked by historical star growth across daily, weekly and monthly periods.
- A shared full-screen loading overlay for Home, Trending, repository searches and search filtering.
- GitHub Actions checks covering Django checks and backend tests, frontend linting and frontend builds.
- A scheduled GitHub Actions workflow for collecting daily repository snapshots.
- Git tags and GitHub Releases documenting development milestones.
- Project documentation, including the README, project plan, presentations, wireframes, user journey, site map and database ERD.

The following features are still under development:

- Repository detail pages and repository contents.
- User registration, login and profile management.
- Saved repositories and following relationships.
- GitHub account connection and authentication.
- Developer profiles and additional profile functionality.

## 7. Current Limitations

Clonvix relies on the GitHub REST API to retrieve public repository and developer information. This introduces some limitations outside the application's direct control:

- **GitHub stargazer access:** The GitHub API does not allow Clonvix to retrieve public stargazer lists for repositories it does not have administrative or collaborator access to. As a result, Clonvix can display repository star counts but cannot provide its own detailed list of users who starred a repository.
- **GitHub API rate limits:** GitHub limits the number of API requests that can be made within a given period. Authentication and server-side caching reduce the number of requests, but high usage can still result in rate-limit restrictions.
- **Topic search data:** The GitHub topic search API provides limited information about topics. It does not provide features such as related topics or comprehensive repository counts, restricting the amount of additional information Clonvix can display.
- **Public repository access:** The current GitHub integration retrieves publicly accessible repository information. Accessing private repositories would require additional permissions and authentication.
- **External API availability:** Clonvix depends on the GitHub REST API for repository, topic and user information. Changes to the API, service interruptions or failed requests can affect the availability of these features.
- **Historical trending data:** GitHub does not provide historical daily star counts through its standard repository search API. Clonvix collects its own snapshots over time to calculate repository star growth. Historical comparisons are therefore limited by the snapshot data collected and retained by the application.

## 8. Key Design Decisions

**React and TypeScript.** The project brief does not require React, and TypeScript is not mentioned at all. Both were chosen deliberately to build on what has been learned so far and to gain more experience with tools used in software development.

**Separate frontend and backend in development, one service in production.** The React frontend and Django backend are separate applications that communicate through a JSON API during development, which is why CORS is configured locally. In production, Django serves the built React app, so everything runs as one Render service on one address. This avoids the need to deploy and maintain two separate services.

**Tailwind CSS instead of Bootstrap, with a custom stylesheet.** Tailwind CSS v4 is installed for styling, and the shared theme colours are defined as variables in `index.css`. The header, navigation and footer also use custom CSS classes in the same stylesheet, following an approach previously used in my last project.

**Solid colours instead of glassmorphism.** Previous projects used a glassmorphism style. For Clonvix, the design uses solid colours instead, giving the site a different appearance while maintaining a professional look. Dark mode uses a navy background, near-black header and footer, and lighter blue cards, with lime green accents for buttons and hover states. The light theme uses grey tones with a darker green accent to maintain readability.

**Theme toggle with System, Light and Dark.** Rather than a simple light/dark switch, users can follow their operating system setting or choose a theme manually. The choice is saved in `localStorage` and applied through a `data-theme` attribute, keeping theme behaviour and styling separate.

**Separate Django apps for accounts and GitHub integration.** The `accounts` app handles Clonvix user functionality, while the `github` app handles GitHub API integration. This keeps account-related functionality separate from repository, topic and user search. The GitHub integration is organised into a client for making API requests, a service layer for handling caching and data processing, and views and URL routes for handling incoming requests.

**Server-side GitHub tokens for public data.** Repository, topic and user searches use a fine-grained GitHub personal access token with read-only access to public repositories. The token provides a higher API rate limit than unauthenticated requests. Local development and production use separate tokens, and neither token is exposed to the frontend. GitHub account connection and user-authorised access will require a separate authentication approach, planned for a later stage.

**Backend handling of repository filtering and sorting.** Repository filtering and sorting are handled through the backend and GitHub API parameters before pagination. This ensures that results are sorted across the matching result set rather than only sorting the repositories currently loaded on the frontend.

**Clonvix relationships kept separate from GitHub.** Saving a repository in Clonvix will not star it on GitHub, and following a GitHub developer will not require that developer to have a Clonvix account. These relationships will be managed within Clonvix rather than changing the user's GitHub activity.

**GitHub data fetched rather than permanently stored.** Current repository and topic information is retrieved from the GitHub REST API and cached temporarily using Redis. This avoids maintaining unnecessary duplicate copies of information that GitHub already provides. Clonvix will store its own application data, such as user accounts, saved repositories and follow relationships, alongside historical repository snapshots.

**Historical repository snapshots.** Historical star counts are not provided by the standard GitHub repository search API. The `RepositorySnapshot` model was introduced to store daily star-count snapshots using the repository's GitHub ID and snapshot date. This allows Clonvix to build its own historical data for calculating repository star growth.

**Render and Neon for deployment.** Render hosts the application, while Neon provides the PostgreSQL database. This setup allows the application and database to be deployed separately while keeping the frontend and backend together within the Render web service.

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

**Redis is provided locally through Layerbase during development and through Upstash in production.**

The deployed hostname is included in `ALLOWED_HOSTS`. Because the frontend and backend share one origin in production, CORS is only required during local development, where the Vite development server runs on a different port.

The GitHub API tokens have an expiry period, so an expired token is one of the first things to check if GitHub requests begin failing with authentication errors.

## 10. Testing

### Manual Testing

Clonvix is currently tested manually throughout development to check that individual features work as expected and that the application behaves correctly.

**Manual testing includes:**

- Running `npm run lint` and `npm run build` from `src/frontend` to check the frontend code and confirm it builds.
- Running `python manage.py check` from `src/backend` to identify Django configuration issues.
- Testing the GitHub repository search endpoint with different search queries and parameters, including language filtering, sorting and pagination.
- Testing the GitHub topic search endpoint separately to confirm that topic results are returned correctly.
- Testing the Trending endpoint across daily, weekly and monthly periods.
- Running the repository snapshot management command and checking that daily snapshots are stored correctly.
- Checking API error handling using requests with missing or invalid parameters.
- Checking responsive layouts by resizing the browser and using the browser's device emulator, including a landscape phone size. Checks cover the hamburger menu opening and closing, the overlay, scrolling inside the menu and the theme dropdown appearing above the open menu.
- Testing the theme toggle by switching between System, Light and Dark.
- Testing browser search functionality, including switching between repository and topic searches and using the available filters.
- Checking the deployed site on Render after each deployment.

### Automated Testing

The `project-checks.yml` GitHub Actions workflow runs Django checks and backend tests, followed by frontend linting and a production build check on pushes and pull requests targeting `main`. Automated testing will be expanded as development continues.

## 11. Challenges and Solutions

- **Connecting the frontend to the backend:** `django-cors-headers` was configured to allow requests from the local React development server. A status endpoint was created to verify the connection. Production uses a shared origin through Django.

- **Serving the React app from Django:** WhiteNoise, Vite's `base` path, `STATICFILES_DIRS` and Django's template directory were configured to serve the built React application. A build script was created and a catch-all route was configured to support direct page refreshes.

- **Integrating the GitHub REST API:** API requests and application logic were separated into client and service layers. The client handles GitHub requests, while the service layer manages caching and data processing for repository, topic and user searches.

- **Managing GitHub API requests and caching:** Separate read-only GitHub tokens were configured for local development and production using environment variables. Server-side Redis caching was implemented to reduce repeated requests and help manage API rate limits.

- **Synchronising the theme with system preferences:** `prefers-color-scheme` was used to follow the operating system by default, while `data-theme` was used to apply a manually selected Light or Dark theme.

- **Layering the mobile menu and theme dropdown:** The `z-index` values were adjusted to keep the theme dropdown visible above the menu and overlay. Scrolling was enabled and spacing was reduced to support shorter landscape screens.

- **Handling GitHub stargazer restrictions:** GitHub restricted access to public stargazer lists for repositories where the authenticated user is not an administrator or collaborator. Clonvix therefore displays repository star counts without providing a list of individual stargazers.

- **Repository sorting:** Frontend sorting initially only affected repositories on the current page. Sorting was moved to Django, where `sort` and `order` parameters were passed to GitHub's API so results were sorted before pagination.

- **Synchronising search parameters with the URL:** Search queries, categories, filters, sorting and pagination were connected to URL parameters, allowing searches to be refreshed, shared and navigated through browser history.

- **Handling different search categories:** Repository, topic and user searches returned different response structures and supported different options. Category-specific handling was implemented to display the correct information and prevent unrelated filters from carrying over.

- **Managing pagination when search options change:** Pagination was configured to reset to the first page when queries, categories, filters or sorting options changed, preventing outdated page selections.

- **Displaying accurate repository activity dates:** GitHub's `updated_at` field was replaced with `pushed_at` on repository cards so the displayed date reflected the last code push.

- **Displaying GitHub topic images:** Since GitHub's topic search endpoint does not provide image URLs, image paths were constructed using GitHub's public Explore repository. An `onError` handler was implemented to hide unavailable images.

- **Developing a custom repository trending system:** GitHub's standard repository search API does not provide historical daily star counts. A `RepositorySnapshot` model was created to store repository IDs, star counts and snapshot dates. A custom Django management command collects these snapshots, allowing Clonvix to calculate daily, weekly and monthly star growth from its own historical data. This approach was inspired by GitHub's Trending presentation.

Further challenges and solutions will be documented as development continues.

## 12. What Was Learned

The development of Clonvix provided practical experience in building a full-stack application using Django, Django REST Framework, React and TypeScript. It built on previous experience with Flask and introduced a more structured backend architecture through separate Django applications, API endpoints and service layers.

Frontend development involved working with reusable React components, TypeScript, React Router and Tailwind CSS. This included managing application state, synchronising search parameters with URL queries, implementing responsive layouts and supporting multiple themes.

Integrating the GitHub REST API provided experience with external API authentication, request handling, rate limits, response structures and server-side caching. It also highlighted the importance of separating API communication from application logic.

Database development involved working with PostgreSQL, Django models, migrations and database relationships. The project also introduced historical data collection through repository snapshots, allowing changes in GitHub star counts to be calculated over time.

Deployment provided practical experience with environment variables, production configuration, Render, Neon PostgreSQL, Gunicorn and WhiteNoise. This highlighted the differences between local development and production environments, particularly when building and serving a React application through Django.

Version control and project management skills were further developed through the use of Git commits, tags, releases and technical documentation.

Overall, the project brought together frontend development, backend architecture, database management, external API integration and deployment within a single application.

## 13. References

### Project and source control
- [Clonvix GitHub repository](https://github.com/ColmN-Dev/Clonvix)
- [Git documentation](https://git-scm.com/doc)

### Frontend
- [React documentation](https://react.dev/)
- [React Router documentation](https://reactrouter.com/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [HTML documentation](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Vite documentation](https://vite.dev/guide/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Lucide React documentation](https://lucide.dev/guide/packages/lucide-react)

### Backend and API
- [Python documentation](https://docs.python.org/3/)
- [Django documentation](https://docs.djangoproject.com/)
- [Django custom authentication documentation](https://docs.djangoproject.com/en/6.1/topics/auth/customizing/)
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