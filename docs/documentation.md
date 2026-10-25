# Clonvix Documentation

**Last updated:** October 25, 2026

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

At this stage, the project has a working foundation. The custom user model, page routing, responsive layout, theme toggle and live deployment are in place. A `repositories` app has been created for the GitHub API features, and the main Clonvix features, beginning with repository search, are being built incrementally on top of this foundation.

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
    │   │   ├── settings.py
    │   │   └── urls.py
    │   └── repositories/
    └── frontend/
        ├── index.html
        ├── package.json
        ├── vite.config.ts
        ├── public/
        └── src/
            ├── App.tsx
            ├── index.css
            ├── main.tsx
            ├── assets/
            ├── components/
            │   ├── Footer.tsx
            │   ├── Header.tsx
            │   ├── Nav.tsx
            │   └── ThemeToggle.tsx
            └── pages/
                ├── About.tsx
                ├── ColmN-Dev.tsx
                ├── Contact.tsx
                └── Home.tsx
```

The `docs` directory contains the project plan, presentations, user-flow and site-map images, wireframes and the database design. The `build.sh` script at the root is run by Render on every deployment. The `src/backend` directory contains the Django project, the `accounts` app and the `repositories` app for the GitHub API features. The `src/frontend` directory contains the React application, shared styling, Vite configuration and brand assets, with reusable layout components in `components` and the routed screens in `pages`.

## 3. Backend

The backend is a Django project located in `src/backend`. Django REST Framework is included in the project dependencies so that the application can expose JSON APIs as the feature work is added. The `accounts` app is intended to contain user accounts, profiles, saved repositories and follow relationships. The `repositories` app has been created to hold the GitHub API features, such as repository search, featured repositories and trending repositories. Keeping these in their own app means `accounts` only deals with users.

The backend currently provides a basic health/status endpoint at `GET /api/status/`. It returns a JSON message which was used to confirm that the frontend and backend can communicate. The Django admin route is also configured at `/admin/`. A catch-all route at the end of `config/urls.py` returns the built React `index.html` for any other URL, so pages such as `/about` still work when refreshed. It skips URLs starting with `api/`, `admin/` and `static/`, and has to stay last in the list.

The custom user model uses email addresses for login instead of usernames, while still keeping a username. It extends Django's built-in user model and is registered in the Django admin panel, where user accounts can be managed. The initial database migrations have been applied, and a superuser account is available for admin access.

The backend settings provide an environment-aware setup:

- PostgreSQL is configured through `DATABASE_URL`, with `dj-database-url` handling the connection settings.
- Environment variables are loaded with `python-dotenv`, including `SECRET_KEY`, `DEBUG` and `GITHUB_API_TOKEN`.
- WhiteNoise serves the built frontend files in production. `STATIC_ROOT` is `staticfiles`, `STATICFILES_DIRS` points at the frontend `dist` folder, and Django's template directory points at `dist` so `index.html` can be found.
- CORS is configured for the local Vite development origins.
- The deployed Render hostname is included in `ALLOWED_HOSTS`.
- Django's standard authentication, sessions and security middleware are enabled.

The GitHub API token is a fine-grained personal access token with read-only access to public repositories and no extra permissions. Separate tokens are used for local development and production, so one can be revoked without affecting the other.

The account models, authentication endpoints, GitHub API integration and feature-specific routes are not complete yet. They will be added in stages, beginning with repository discovery. The planned structure inside the `repositories` app is a `github_client.py` for the raw GitHub API calls, a `services.py` for the logic and caching, and `views.py` and `urls.py` for the endpoints.

## 4. Frontend

The frontend is a React application written in TypeScript and built with Vite. The entry point renders the `App` component, which uses React Router to show the Home, About, ColmN-Dev and Contact pages. ColmN-Dev and Contact are placeholders for now.

The layout is built from separate components. `Header` contains the Clonvix logo and title, the `Nav` links and the `ThemeToggle`. `Footer` contains the brand, explore links and a GitHub link. On screens below 1050px the nav links collapse into a hamburger button that opens a slide-out menu with a dark overlay. The button switches between a menu and a close icon, and the menu closes when the overlay or a link is clicked. Icons come from `lucide-react`.

The theme toggle offers System, Light and Dark. The choice is saved in `localStorage` and applied by setting a `data-theme` attribute on the `<html>` element. In System mode the attribute is removed and the CSS follows the operating system through `prefers-color-scheme`.

Tailwind CSS v4 is configured through the Vite plugin, alongside a custom stylesheet in `src/frontend/src/index.css`. The stylesheet holds the Clonvix visual language and the responsive rules, including:

- Inter and Sora typography.
- Light and dark colour themes, with a darker green accent in light mode and a lime accent in dark mode.
- Shared background, text, border and card colour variables.
- Header, navigation, theme toggle and footer styles.
- The hamburger menu and responsive breakpoints for tablets, small phones and landscape phones.
- Basic focus-visible styling for keyboard accessibility.

The Home page has a hero section with a blurred background image, which is still being developed. Planned screens still to be built include repository search results, repository details, saved repositories, developer profiles, account settings and the ColmN-Dev showcase. A search bar, featured repository carousels and a trending repositories grid are planned for the Home page. Shared repository cards will be introduced as these screens are implemented.

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

The following parts of Clonvix are in place at this stage:

- A Django backend with Django REST Framework included in its dependencies.
- A Vite, React and TypeScript frontend, deployed on Render.
- A custom Django user model with email login, registered in the admin.
- React Router with Home, About, ColmN-Dev and Contact pages.
- A responsive header and footer, with a slide-out hamburger menu on smaller screens.
- A System, Light and Dark theme toggle, saved between visits.
- A status endpoint at `GET /api/status/`.
- Environment-based configuration for the secret key, debug mode, database connection and GitHub API token.
- A single-service deployment where Django serves the built React app through WhiteNoise, with a build script that runs on every deploy.
- The `repositories` app, created for the GitHub API features.
- Tailwind CSS v4 set up through the Vite plugin, with shared theme colour variables in `index.css`.
- The initial Clonvix branding, including the logo.
- Project documentation: project documentation, README, project plan, presentations, wireframes, user journey, site map and database ERD.

The main Clonvix features, such as repository search, saved repositories and following, have not been built yet.

## 7. Current Limitations

Clonvix is still early in development, so the current limitations are mostly features that are planned but not started:

- The Home page hero section is still in progress, and the ColmN-Dev and Contact pages are placeholders.
- There is no search, and no featured or trending repositories yet.
- There is no user registration, login or profile functionality yet.
- The custom user model is in place, but the models for profiles, saved repositories and follow relationships still need to be implemented.
- The remaining database models and migrations have not been created. The ERD is still a design for those tables.
- There is no GitHub API integration yet, so no repository data is shown. The token configuration is in place, but nothing uses it yet.
- GitHub login and the option to connect a GitHub account have not been started.
- There are no automated tests yet.
- The colour themes and layout may still change.

## 8. Key Design Decisions

**React and TypeScript.** The project brief does not require React, and TypeScript is not mentioned at all. Both were chosen deliberately to build on what has been learned so far and to get more experience with tools used in software development.

**Separate frontend and backend in development, one service in production.** The React frontend and Django backend are separate applications that communicate through a JSON API while developing, which is why CORS is configured locally. In production, Django serves the built React app, so everything runs as one Render service on one address. This avoids CORS problems and the cost of running two services.

**Tailwind CSS instead of Bootstrap, with a custom stylesheet.** Tailwind CSS v4 is installed for styling, and the shared theme colours are defined as variables in `index.css`. The header, navigation and footer are styled with plain CSS classes in the same stylesheet, in the same way as the NodeNexus project.

**Solid colours instead of glassmorphism.** Previous projects used a glassmorphism style. For Clonvix the design uses solid colours instead, so the site looks different from earlier work while still looking professional. Dark mode uses a navy background, near-black header and footer and lighter blue cards, with lime green accents for buttons and hover states. The light theme uses grey tones with a darker green accent so it stays readable on light backgrounds.

**Theme toggle with System, Light and Dark.** Rather than a simple light/dark switch, users can follow their operating system setting or choose a theme manually. The choice is saved in `localStorage` and applied through a `data-theme` attribute, which keeps the CSS in one place.

**Separate Django app for the GitHub features.** The repository search, featured and trending features live in their own `repositories` app, while `accounts` is reserved for users. The GitHub API code is planned to be split into a client that makes the raw calls and a service layer that adds caching and shapes the data, so each part has one job.

**Server-side GitHub tokens for public data.** Search, featured and trending only read public data, so the server calls GitHub with a read-only fine-grained token. Without a token GitHub allows far fewer requests per hour, so the token is needed. Local and production use separate tokens, and the token is never exposed to the frontend. A GitHub App is planned later for signing in and connecting accounts, since that needs permission from each user.

**Clonvix relationships kept separate from GitHub.** Saving a repository does not star it on GitHub, and following a GitHub developer does not require them to have a Clonvix account.

**GitHub data fetched rather than stored.** Repository and developer information comes from the GitHub REST API and is cached briefly, so Clonvix only stores its own data, such as users, saved repositories and follows.

**Render and Neon for deployment.** Render hosts the application and Neon hosts the PostgreSQL database.

## 9. Deployment

Clonvix is deployed on Render as a single web service at [clonvix.onrender.com](https://clonvix.onrender.com), with the PostgreSQL database hosted on Neon. Django serves the built React app, so the frontend and backend share one address.

Render uses these commands:

- **Build command:** `bash build.sh`
- **Start command:** `cd src/backend && gunicorn config.wsgi:application`

`build.sh` runs on every deploy and does the following in order:

1. Installs the frontend dependencies and builds the React app with `npm run build`, which creates the `dist` folder.
2. Installs the Python dependencies from `requirements.txt`.
3. Runs `collectstatic`, which copies the contents of `dist` into `staticfiles`.
4. Runs the database migrations.

Gunicorn then runs Django instead of the development server, and WhiteNoise serves the files in `staticfiles` to the browser. A few settings have to line up for this to work:

- `base: '/static/'` in `vite.config.ts` makes the built `index.html` ask for its scripts and styles at `/static/...`, which is where WhiteNoise serves them.
- `STATICFILES_DIRS` in `settings.py` points at the `dist` folder, so `collectstatic` picks up everything React built.
- The `dist` folder is also set as a template directory, so Django can return `index.html`.
- The catch-all route in `config/urls.py` returns `index.html` for any other URL, so React Router pages work on refresh.

Environment variables are set in the Render dashboard and are not committed to the repository:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key for production |
| `DATABASE_URL` | Neon PostgreSQL connection string, including `sslmode=require` |
| `DEBUG` | Set to `False` in production |
| `GITHUB_API_TOKEN` | Production GitHub token with read-only access to public data |

The deployed hostname is included in `ALLOWED_HOSTS`. Because the frontend and backend share one origin in production, CORS is only needed for local development, where the Vite dev server runs on a different port. The GitHub tokens expire after a set period, so an expired token is the first thing to check if GitHub requests start failing with authorization errors.

## 10. Testing

No automated tests have been written yet. At this stage the project is checked in the following ways:

- `npm run lint` and `npm run build` are run from `src/frontend` to check the frontend code and confirm it builds.
- The responsive layout is checked by resizing the browser and using the browser's device emulator, including a landscape phone size. The checks cover the hamburger menu opening and closing, the overlay, scrolling inside the menu, and the theme dropdown appearing on top of the open menu.
- The theme toggle is checked by switching between System, Light and Dark.
- The deployed site on Render is checked in the browser after each deployment.

Automated tests for the backend and further checks for the frontend will be added as the main features are built, and this section will be updated to describe what is covered and how the tests are run.

## 11. Challenges and Solutions

**Connecting the frontend to the backend.** The React app and the Django backend run on different addresses during development, so by default the browser blocks the frontend's requests to the API. This was solved by configuring CORS in Django with `django-cors-headers`, allowing the local frontend addresses. A small status endpoint and a message on the frontend were added to confirm that the connection works. In production the problem goes away because Django serves the frontend itself.

**Serving the React app from Django.** In production there is one server, so Django has to hand the browser the built React files. This needed WhiteNoise to serve the static files, a build script to build React and collect the files, and several settings that had to agree with each other: Vite's `base` path, `STATICFILES_DIRS` and the template directory. A catch-all route was also needed so that refreshing a page such as `/about` returns the React app instead of a 404.

**Keeping the theme in sync between the OS and the user's choice.** The site needed to follow the operating system by default, but also let the user pick a theme. This was solved by using a `data-theme` attribute only when the user chooses Light or Dark, and by using `prefers-color-scheme` in the CSS only when the attribute is absent.

**Layering the mobile menu and the theme dropdown.** The slide-out menu and its overlay covered the theme dropdown when both were open. Raising the dropdown's `z-index` above the menu and overlay fixed it. The menu also had to scroll on short landscape phone screens, which was solved by allowing the panel to scroll and tightening the spacing on short screens.

When more challenges and solutions arise, they will be added here as the project progresses.

## 12. What Was Learned

To be completed as the project progresses.

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
- [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Cloudinary documentation](https://cloudinary.com/documentation)
- [Brevo API documentation](https://developers.brevo.com/)

### Hosting and deployment
- [Render documentation](https://render.com/docs)
- [Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)