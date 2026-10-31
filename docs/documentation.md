# Clonvix Documentation

**Last updated:** October 31, 2026

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

Clonvix is a full-stack web application that combines a personal developer portfolio with a GitHub repository explorer. The aim is to make it easier for people to discover software projects and developers, while giving registered users a place to save repositories, follow developers and manage a developer profile.

Visitors will be able to search public GitHub repositories, view repository details and browse repository contents without creating an account. Authenticated users will have access to additional features such as saved repositories, following relationships and profile management. Users will also be able to connect a GitHub account so that Clonvix can display their public repositories and support GitHub-based login.

The project is being developed with React and TypeScript on the frontend and Django with Django REST Framework on the backend. PostgreSQL is used for permanent application data, while the GitHub REST API will provide repository and developer information. The application is hosted on Render, with Neon providing the PostgreSQL database.

At this stage, the project has a working foundation, including the custom user model, page routing, responsive layout, theme toggle and live deployment. The `github` app now handles GitHub API integration, with working repository and topic search, server-side caching, language filtering and repository sorting. User search, developer profiles, repository details and authenticated user functionality remain to be developed.

## 2. Project Structure

The project is split into documentation, a Django backend and a Vite-powered React frontend. The tree below shows the key files and folders, and this structure can change as new features are added.

```text
Clonvix/
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

The `docs` directory contains the project plan, presentations, user-flow and site-map images, wireframes and database design. The `build.sh` script at the project root is run by Render during each deployment. The `src/backend` directory contains the Django project, the `accounts` app for user-related functionality and the `github` app for GitHub API integration, including repository and topic search. The `src/frontend` directory contains the React application, with `App.tsx` handling the main application routes and `main.tsx` serving as the entry point. Shared styling is maintained in `index.css`, while reusable components are organised in `components` and routed screens in `pages`. Vite and TypeScript configuration files are located at the frontend root.

## 3. Backend

The backend is a Django project located in `src/backend`. Django REST Framework is included in the project dependencies to expose JSON APIs to the frontend. The `accounts` app handles user-related functionality, including the custom user model, while the `github` app handles integration with the GitHub REST API. This includes repository and topic search, with the GitHub API requests handled separately from the views and caching managed through the service layer.

The backend currently provides a health/status endpoint at `GET /api/status/`, which returns a JSON response used to confirm communication between the frontend and backend. The Django admin route is configured at `/admin/`. A catch-all route at the end of `config/urls.py` returns the built React `index.html` for frontend routes such as `/about`, allowing them to work when refreshed. It skips URLs starting with `api/`, `admin/` and `static/`, and must remain last in the URL configuration.

The custom user model uses email addresses for login while retaining a username. It extends Django's built-in user model and is registered in the Django admin panel, where user accounts can be managed. The initial database migrations have been applied, and a superuser account is available for admin access. Additional account functionality, including registration, profiles and authentication endpoints, is still to be developed.

The backend settings provide an environment-aware setup:

- PostgreSQL is configured through `DATABASE_URL`, with `dj-database-url` handling the connection settings.
- Environment variables are loaded with `python-dotenv`, including `SECRET_KEY`, `DEBUG` and `GITHUB_API_TOKEN`.
- WhiteNoise serves the built frontend files in production. `STATIC_ROOT` is `staticfiles`, `STATICFILES_DIRS` points at the frontend `dist` folder, and Django's template directory points at `dist` so `index.html` can be found.
- CORS is configured for the local Vite development origins.
- The deployed Render hostname is included in `ALLOWED_HOSTS`.
- Django's standard authentication, sessions and security middleware are enabled.

The GitHub API token is a fine-grained personal access token with read-only access to public repositories. Separate tokens are used for local development and production, so one can be revoked without affecting the other. The token is stored in an environment variable and is not exposed to the frontend.

The `github` app currently handles repository and topic search through the GitHub REST API. The API endpoint is `GET /api/github/search/`, which requires a search query. Repository searches support language filtering and sorting, while topic searches use the GitHub topic search endpoint. The GitHub API requests are separated into `github_client.py`, while `services.py` handles the service logic and server-side caching. The views in `views.py` process incoming requests, and `urls.py` defines the app's API routes.

User search, repository detail pages, developer profiles and further authenticated functionality remain to be implemented.

## 4. Frontend

The frontend is a React application written in TypeScript and built with Vite. The entry point renders the `App` component, which uses React Router to handle navigation between the Home, About, ColmN-Dev, Contact and Search Results pages. The ColmN-Dev, About and Contact pages are placeholders for now.

The layout is built from separate components. `Header` contains the Clonvix logo and title, the `Nav` links and the `ThemeToggle`. `Footer` contains the brand, explore links and a GitHub link. On screens below 1050px the navigation links collapse into a hamburger button that opens a slide-out menu with a dark overlay. The button switches between a menu and close icon, and the menu closes when the overlay or a link is clicked. Icons come from [`lucide-react`](https://lucide.dev/icons/).

The theme toggle offers System, Light and Dark. The choice is saved in `localStorage` and applied by setting a `data-theme` attribute on the `<html>` element. In System mode the attribute is removed and the CSS follows the operating system through `prefers-color-scheme`.

Tailwind CSS v4 is configured through the Vite plugin, alongside a custom stylesheet in `src/frontend/src/index.css`. The stylesheet holds the Clonvix visual language and responsive rules, including:

- Inter and Sora typography.
- Light and dark colour themes, with a darker green accent in light mode and a lime accent in dark mode.
- Shared background, text, border and card colour variables.
- Header, navigation, theme toggle and footer styles.
- The hamburger menu and responsive breakpoints for screens below 1050px, tablets, small phones and landscape phones.
- Basic `focus-visible` styling for keyboard accessibility.

The Search Results page supports repository and topic searches through the Django API. Repository results include information such as the repository name, owner, description, programming language, topics and star count. Repository searches support language filtering and sorting, while topic searches display topic information and available images. Search options and filters are reflected in the URL query parameters, allowing search results to be shared or revisited.

The Home page has a hero section with a blurred background image. Planned features include repository details, saved repositories, developer profiles, account settings and the ColmN-Dev showcase. Featured repository carousels and a trending repositories grid are also planned for the Home page.

## 5. Database

PostgreSQL is the persistent database for Clonvix, hosted on Neon. Django's ORM is used to create and work with the database models. The database is intended to store Clonvix-specific data, while current GitHub repository and developer information will normally be retrieved from the GitHub REST API and cached for short periods.

The initial ERD in [`clonvix-erd.dbml`](./clonvix-erd.dbml) describes the following planned tables:

| Table | Purpose |
|---|---|
| `user` | Stores email-based Clonvix accounts, usernames and Django authentication fields. |
| `profile` | Stores optional profile information such as display name, biography, profile image and social links. |
| `username_change_log` | Keeps previous usernames so that old profile URLs can continue to be resolved. |
| `github_connection` | Links a Clonvix account to a connected GitHub account using its stable GitHub ID. |
| `saved_repository` | Stores a user's saved repositories and a snapshot of relevant repository details. |
| `follow` | Stores relationships where one Clonvix user follows another Clonvix user. |
| `github_follow` | Stores relationships where a Clonvix user follows a GitHub developer, including developers without Clonvix accounts. |

The design deliberately keeps Clonvix relationships separate from GitHub relationships. Saving a repository will not star it on GitHub, and following a GitHub developer will not require that developer to register with Clonvix. Unique constraints in the design prevent duplicate saved repositories and duplicate follow relationships for the same user pair.

The `user` table is implemented as the custom user model. The remaining tables are still the design reference rather than completed Django models and migrations. The ERD will be reviewed against the implemented features as development continues, and any changes to the schema will be reflected in both the models and this documentation.

## 6. Implemented Features

**The following parts of Clonvix are in place at this stage:**

- A Django backend with Django REST Framework.
- A React, TypeScript and Vite frontend, deployed on Render.
- A custom Django user model with email login, registered in the Django admin.
- React Router with Home, About, ColmN-Dev, Contact and Search Results pages.
- A responsive header and footer, with a slide-out hamburger menu on smaller screens.
- A System, Light and Dark theme toggle, with the preference saved between visits.
- A status endpoint at `GET /api/status/`.
- GitHub repository search through the GitHub REST API.
- GitHub topic search through the GitHub REST API.
- Server-side caching of GitHub search responses.
- Repository language filtering and sorting.
- URL query parameters for search queries, categories, filters and sorting options.
- Repository result cards displaying owner information, descriptions, programming languages, topics and star counts.
- Topic result cards displaying topic information and available images.
- Environment-based configuration for the secret key, debug mode, database connection and GitHub API token.
- A single-service deployment where Django serves the built React app through WhiteNoise, with a build script that runs on every deployment.
- A dedicated `github` Django app for GitHub API integration, separate from the `accounts` app.
- Tailwind CSS v4 configured through the Vite plugin, with shared theme colour variables in `index.css`.
- Initial Clonvix branding, including the logo.
- Project documentation, including the README, project plan, presentations, wireframes, user journey, site map and database ERD.

**The following features are still under development:**

- User search and developer profiles.
- Repository detail pages and repository contents.
- User registration, login and profile management.
- Saved repositories and following relationships.
- GitHub account connection and authentication.

## 7. Current Limitations

Clonvix relies on the GitHub REST API to retrieve public repository and topic information. This introduces some limitations outside the application's direct control:

- **GitHub stargazer access:** GitHub restricts access to public stargazer lists to repository administrators and collaborators. This prevents Clonvix from linking visitors directly to a repository's stargazers, so the star count is currently displayed as an informational statistic.
- **GitHub API rate limits:** Requests are subject to GitHub's API rate limits. Authentication and server-side caching help reduce the impact, but requests can still be restricted.
- **Limited topic information:** The GitHub topic search endpoint does not return all potentially useful information, such as related topics and repository counts.
- **Public repository access:** The current integration focuses on publicly accessible GitHub repositories. Private repository access is not supported.
- **External API dependency:** Repository and topic search depend on GitHub's availability. API errors or service interruptions can affect search functionality.
- **No automated tests:** The project currently relies on manual testing, meaning regressions may not be detected automatically.
- **Single-service deployment:** The Django backend serves the built React frontend in production, rather than using separate frontend and backend deployments.

## 8. Key Design Decisions

**React and TypeScript.** The project brief does not require React, and TypeScript is not mentioned at all. Both were chosen deliberately to build on what has been learned so far and to gain more experience with tools used in software development.

**Separate frontend and backend in development, one service in production.** The React frontend and Django backend are separate applications that communicate through a JSON API during development, which is why CORS is configured locally. In production, Django serves the built React app, so everything runs as one Render service on one address. This avoids the need to deploy and maintain two separate services.

**Tailwind CSS instead of Bootstrap, with a custom stylesheet.** Tailwind CSS v4 is installed for styling, and the shared theme colours are defined as variables in `index.css`. The header, navigation and footer also use custom CSS classes in the same stylesheet, following an approach previously used in my last project.

**Solid colours instead of glassmorphism.** Previous projects used a glassmorphism style. For Clonvix, the design uses solid colours instead, giving the site a different appearance while maintaining a professional look. Dark mode uses a navy background, near-black header and footer, and lighter blue cards, with lime green accents for buttons and hover states. The light theme uses grey tones with a darker green accent to maintain readability.

**Theme toggle with System, Light and Dark.** Rather than a simple light/dark switch, users can follow their operating system setting or choose a theme manually. The choice is saved in `localStorage` and applied through a `data-theme` attribute, keeping theme behaviour and styling separate.

**Separate Django apps for accounts and GitHub integration.** The `accounts` app handles Clonvix user functionality, while the `github` app handles GitHub API integration. This keeps account-related functionality separate from repository and topic search. The GitHub integration is organised into a client for making API requests, a service layer for handling caching and data processing, and views and URL routes for handling incoming requests.

**Server-side GitHub tokens for public data.** Repository and topic searches use a fine-grained GitHub personal access token with read-only access to public repositories. The token provides a higher API rate limit than unauthenticated requests. Local development and production use separate tokens, and neither token is exposed to the frontend. GitHub account connection and user-authorised access will require a separate authentication approach, planned for a later stage.

**Clonvix relationships kept separate from GitHub.** Saving a repository in Clonvix will not star it on GitHub, and following a GitHub developer will not require that developer to have a Clonvix account. These relationships will be managed within Clonvix rather than changing the user's GitHub activity.

**GitHub data fetched rather than permanently stored.** Repository and topic information is retrieved from the GitHub REST API and cached temporarily. This avoids maintaining duplicate copies of information that GitHub already provides. Clonvix will store its own application data, such as user accounts, saved repositories and follow relationships.

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
| `DEBUG` | Set to `False` in production |
| `GITHUB_API_TOKEN` | Production GitHub token with read-only access to public data |

The deployed hostname is included in `ALLOWED_HOSTS`. Because the frontend and backend share one origin in production, CORS is only required during local development, where the Vite development server runs on a different port.

The GitHub API tokens have an expiry period, so an expired token is one of the first things to check if GitHub requests begin failing with authentication errors.

## 10. Testing

No automated tests have been written yet. At this stage, the project is checked through manual testing and the following development commands:

- `npm run lint` and `npm run build` are run from `src/frontend` to check the frontend code and confirm it builds.
- `python manage.py check` is run from `src/backend` to identify Django configuration issues.
- The GitHub repository search endpoint is tested using different search queries and parameters, including language filtering and sorting.
- The GitHub topic search endpoint is tested separately to confirm that topic results are returned correctly.
- API error handling is checked by testing requests with missing or invalid parameters.
- The responsive layout is checked by resizing the browser and using the browser's device emulator, including a landscape phone size. Checks cover the hamburger menu opening and closing, the overlay, scrolling inside the menu and the theme dropdown appearing on top of the open menu.
- The theme toggle is checked by switching between System, Light and Dark.
- Search functionality is checked in the browser, including switching between repository and topic searches and using the available filters.
- The deployed site on Render is checked in the browser after each deployment.

Automated tests for the backend and frontend will be added as development continues. This section will be updated to describe the tests, their coverage and how they are run.

## 11. Challenges and Solutions

**Connecting the frontend to the backend.** The React app and Django backend run on different addresses during development, so by default the browser blocks the frontend's requests to the API. This was solved by configuring CORS in Django with `django-cors-headers`, allowing the local frontend addresses. A status endpoint and a message on the frontend were added to confirm that the connection works. In production, the problem is avoided because Django serves the frontend itself.

**Serving the React app from Django.** In production there is one server, so Django has to return the built React application and serve its static files. This required WhiteNoise, a build script to build React and collect the files, and several settings that had to work together: Vite's `base` path, `STATICFILES_DIRS` and the template directory. A catch-all route was also needed so that refreshing a page such as `/about` returns the React app instead of a 404.

**Integrating the GitHub REST API.** Connecting Clonvix to GitHub required handling external API requests, authentication and different response types. The integration was organised into separate client and service layers. The client makes the API requests, while the service layer handles caching and data processing. Repository and topic searches were implemented through their respective GitHub endpoints.

**Managing GitHub API requests and caching.** Unauthenticated GitHub requests have a much lower rate limit, so a server-side personal access token was configured through environment variables. Search responses are also cached temporarily to reduce repeated requests and unnecessary API calls. Separate tokens are used for local development and production.

**Keeping the theme in sync between the OS and the user's choice.** The site needed to follow the operating system by default, but also let the user pick a theme. This was solved by using a `data-theme` attribute only when the user chooses Light or Dark, and by using `prefers-color-scheme` in the CSS when the attribute is absent.

**Layering the mobile menu and the theme dropdown.** The slide-out menu and its overlay covered the theme dropdown when both were open. Raising the dropdown's `z-index` above the menu and overlay fixed it. The menu also had to scroll on short landscape phone screens, which was solved by allowing the panel to scroll and tightening the spacing on short screens.

**Handling GitHub stargazer restrictions.** During development, links to repository stargazer lists returned 404 responses for ordinary visitors. GitHub restricts access to these lists to repository administrators and collaborators. Since this restriction cannot be fixed through Clonvix, the star count remains visible as an informational statistic rather than linking to the stargazer list.

**Repository sorting.** Initially, sorting was handled in the React frontend using `.sort()`, meaning only the repositories already loaded on the current page were sorted. The sorting state also wasn't being passed correctly to the backend. This was resolved by moving sorting to the Django backend and passing the `sort` and `order` parameters to GitHub's API, allowing GitHub to sort the results before returning them.

**Displaying GitHub topic images.** The GitHub topic search endpoint does not provide image URLs for topics. To display topic images, a URL is constructed using GitHub's public Explore repository, following its topic image directory structure. An `onError` handler hides the image when a matching image cannot be found, preventing broken image placeholders from appearing.

Further challenges and solutions will be documented as development continues.

## 12. What Was Learned

Working on Clonvix has helped me understand how the different parts of a full-stack application fit together. Having previously worked with Flask, moving to Django and Django REST Framework has given me more experience with backend development, API endpoints, database configuration and structuring a project across multiple apps.

On the frontend, I've gained experience with React, TypeScript and Tailwind CSS. I've had to learn how components work together, how routing is handled and how the frontend communicates with the backend. I've also become more comfortable working with responsive layouts, CSS and managing application state.

One of the biggest learning experiences has been integrating the GitHub REST API. This involved understanding external API requests, authentication tokens, rate limits, response data and caching. It also showed me why it's important to separate responsibilities in the backend rather than putting everything into one file.

I've also gained more experience with Git, environment variables and deploying an application using Render and Neon. Getting the application working locally is one thing, but making sure it builds and runs correctly in production introduced a different set of challenges.

Overall, the project has helped me become more confident working across the frontend and backend. I've also learned that debugging often involves looking beyond the file where an issue first appears and understanding how different parts of the application interact.

There is still more to learn as I work on authentication, GitHub account integration and the remaining features.

## 13. References

### Project and source control
- [Clonvix GitHub repository](https://github.com/ColmN-Dev/Clonvix)
- [Git documentation](https://git-scm.com/doc)

### Frontend
- [React documentation](https://react.dev/)
- [React Router documentation](https://reactrouter.com/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Vite documentation](https://vite.dev/guide/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Lucide React documentation](https://lucide.dev/guide/packages/lucide-react)

### Backend and API
- [Python documentation](https://docs.python.org/3/)
- [Django documentation](https://docs.djangoproject.com/)
- [Django custom authentication documentation](https://docs.djangoproject.com/en/6.1/topics/auth/customizing/)
- [Django admin site documentation](https://docs.djangoproject.com/en/6.1/ref/contrib/admin/)
- [Django model forms documentation](https://docs.djangoproject.com/en/6.1/topics/forms/modelforms/)
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

### Hosting and deployment
- [Render documentation](https://render.com/docs)
- [Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)