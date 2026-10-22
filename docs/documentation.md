# Clonvix Documentation

**Last updated:** October 22, 2026

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

The project is being developed with React and TypeScript on the frontend and Django with Django REST Framework on the backend. PostgreSQL is planned for permanent application data, while the GitHub REST API will provide repository and developer information. The intended production services are Render for hosting and Neon for the PostgreSQL database.

At this stage, the project is in its initial implementation phase. The application structure, visual direction, database design and frontend/backend connection have been started. The current working slice is a simple frontend-to-backend status request; the main Clonvix features are being built incrementally from this foundation.

## 2. Project Structure

The project is split into documentation, a Django backend and a Vite-powered React frontend. The tree below shows the tracked files currently in the repository. Dependency folders such as `src/backend/.venv` and `src/frontend/node_modules` are intentionally not shown, and this structure can change as new features are added.

```text
Clonvix/
├── README.md
├── docs/
│   ├── clonvix-erd.dbml
│   ├── clonvix-erd.png
│   ├── documentation.md
│   ├── project-plan.md
│   ├── images/
│   │   ├── clonvix-site-map.png
│   │   └── user-journey.png
│   ├── presentations/
│   │   ├── presentation-01.md
│   │   └── presentation-02.md
│   └── wireframes/
│       ├── homepage.png
│       ├── profile.png
│       └── search-results.png
└── src/
    ├── backend/
    │   ├── manage.py
    │   ├── requirements.txt
    │   ├── accounts/
    │   │   ├── __init__.py
    │   │   ├── admin.py
    │   │   ├── apps.py
    │   │   ├── models.py
    │   │   ├── tests.py
    │   │   ├── views.py
    │   │   └── migrations/
    │   │       └── __init__.py
    │   └── config/
    │       ├── __init__.py
    │       ├── asgi.py
    │       ├── settings.py
    │       ├── urls.py
    │       └── wsgi.py
    └── frontend/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── package-lock.json
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── public/
        │   └── clonvix-logo.png
        └── src/
            ├── App.tsx
            ├── index.css
            ├── main.tsx
            └── assets/
                └── clonvix-logo.png
```

The `docs` directory contains the project plan, presentations, user-flow and site-map images, wireframes and the database design. The `src/backend` directory contains the Django project and the initial `accounts` app. The `src/frontend` directory contains the React application, shared styling, Vite configuration and brand assets.

## 3. Backend

The backend is a Django project located in `src/backend`. Django REST Framework is included in the project dependencies so that the application can expose JSON APIs as the feature work is added. The `accounts` app is intended to contain user accounts, profiles, saved repositories and follow relationships.

The backend currently provides a basic health/status endpoint at `GET /api/status/`. It returns a JSON message which is used by the frontend to confirm that the two applications can communicate. The Django admin route is also configured at `/admin/`.

The custom user model uses email addresses for login instead of usernames. It extends Django's built-in user model and is registered in the Django admin panel, where user accounts can be managed. The initial database migrations have been applied, and a superuser account is available for admin access.

The backend settings already provide the initial environment-aware setup:

- PostgreSQL is configured through `DATABASE_URL`, with `dj-database-url` handling the connection settings.
- Environment variables are loaded with `python-dotenv`.
- CORS is configured for the local Vite development origins.
- The deployed Render hostname is included in `ALLOWED_HOSTS`.
- Django's standard authentication, sessions and security middleware are enabled.

The account models, authentication endpoints, GitHub API integration and feature-specific routes are not complete yet. They will be added in stages, beginning with the core account flow and repository discovery.

## 4. Frontend

The frontend is a React application written in TypeScript and built with Vite. The current entry point renders the `App` component, which makes a request to the backend status endpoint and displays either the returned message or a connection error.

Tailwind CSS v4 is configured through the Vite plugin, alongside a custom stylesheet in `src/frontend/src/index.css`. The stylesheet establishes the initial Clonvix visual language, including:

- Inter and Sora typography.
- Light and dark colour themes.
- Light green accent colours.
- Shared background, text, border and card colour variables.
- Basic focus-visible styling for keyboard accessibility.

The frontend dependencies and configuration are in place for the main interface to be developed. Planned screens include the homepage, repository search results, repository details, saved repositories, developer profiles, account settings, the ColmN-Dev showcase, About and Contact pages. Shared repository cards and reusable layout components will be introduced as these screens are implemented.

## 5. Database

PostgreSQL is the planned persistent database for Clonvix. Django's ORM will be used to create and work with the database models. The database is intended to store Clonvix-specific data, while current GitHub repository and developer information will normally be retrieved from the GitHub REST API and cached for short periods.

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

The ERD is currently the design reference rather than a completed set of Django models and migrations. It will be reviewed against the implemented features as development continues, and any changes to the schema will be reflected in both the models and this documentation.

## 6. Implemented Features

The following parts of Clonvix are in place at this stage:

- A Django backend with Django REST Framework included in its dependencies.
- A Vite, React and TypeScript frontend.
- A status endpoint at `GET /api/status/` and a frontend check that displays the result, which confirms the two applications can communicate.
- CORS configured so the local frontend can make requests to the backend.
- Environment-based configuration for the secret key, debug mode and database connection.
- Tailwind CSS v4 set up through the Vite plugin, with shared theme colour variables in `index.css`.
- The initial Clonvix branding, including the logo.
- Project documentation: project documentation, README, project plan, presentations, wireframes, user journey, site map and database ERD.

The main Clonvix features, such as repository search, accounts and saved repositories, have not been built yet.

## 7. Current Limitations

Clonvix is early in development, so the current limitations are mostly features that are planned but not started:

- The frontend currently only shows the backend status check; none of the planned screens have been built.
- There are no user accounts, login or profiles yet.
- The custom user model is in place, but the models for profiles, saved repositories and follow relationships still need to be implemented.
- The database models and migrations have not been created. The ERD is still a design only.
- There is no GitHub API integration yet, so no repository data is shown.
- The project has not been deployed. The backend address used by the frontend is set for local development and will need to change for deployment.
- There are no automated tests yet.
- The colour themes are a first version and may still change.

## 8. Key Design Decisions

**React and TypeScript.** The project brief does not require React, and TypeScript is not mentioned at all. Both were chosen deliberately to build on what has been learned so far and to get more experience with tools used in software development.

**Separate frontend and backend.** The React frontend and Django backend are separate applications that communicate through a JSON API. This is why CORS has to be configured, but it keeps the two sides independent and lets Django REST Framework serve the data.

**Tailwind CSS instead of Bootstrap.** Tailwind CSS v4 is used for styling, with the shared theme colours defined as variables in `index.css`.

**Solid colours instead of glassmorphism.** Previous projects used a glassmorphism style. For Clonvix the design uses solid colours instead, so the site looks different from earlier work while still looking professional. Dark mode uses a navy background, black header and footer and lighter blue cards, with lime green accents for buttons and hover states. The light theme is plain white and grey.

**Clonvix relationships kept separate from GitHub.** Saving a repository does not star it on GitHub, and following a GitHub developer does not require them to have a Clonvix account.

**GitHub data fetched rather than stored.** Repository and developer information comes from the GitHub REST API and is cached briefly, so Clonvix only stores its own data, such as users, saved repositories and follows.

**Render and Neon for deployment.** Render is planned for hosting and Neon for the PostgreSQL database.

## 9. Deployment

Clonvix deployment is in progress. The plan is to host it on Render and use Neon for the PostgreSQL database.

The main points of the plan are:

- The frontend will be built with `npm run build` and the backend will run with Gunicorn instead of the Django development server.
- The database connection will come from the `DATABASE_URL` environment variable.
- Secrets such as the Django secret key and API keys will be kept in environment variables and not committed to the repository.
- `DEBUG` will be turned off in production.
- The deployed backend address will be added to `ALLOWED_HOSTS`.

Because the frontend and backend run on different addresses, the deployed frontend URL will also need to be added to the CORS settings, alongside the local development addresses. The backend currently allows `http://localhost:5173` and `http://127.0.0.1:5173`.

This section will be updated with the real deployment steps once the project has been deployed.

## 10. Testing

No automated tests have been written yet. At this stage the project is checked in the following ways:

- The frontend status check confirms that the React app can reach the Django backend.
- `npm run lint` and `npm run build` are run from `src/frontend` to check the frontend code and confirm it builds.

Automated tests for the backend and further checks for the frontend will be added as the main features are built, and this section will be updated to describe what is covered and how the tests are run.

## 11. Challenges and Solutions

**Connecting the frontend to the backend.** The React app and the Django backend run on different addresses during development, so by default the browser blocks the frontend's requests to the API. This was solved by configuring CORS in Django with `django-cors-headers`, allowing the local frontend addresses. A small status endpoint and a message on the frontend were added to confirm that the connection works.

When more challenges and solutions arise, they will be added here as the project progresses.

## 12. What Was Learned

To be completed as the project progresses.

## 13. References

### Project and source control
- [Clonvix GitHub repository](https://github.com/ColmN-Dev/Clonvix)
- [Git documentation](https://git-scm.com/doc)

### Frontend
- [React documentation](https://react.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Vite documentation](https://vite.dev/guide/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)

### Backend and API
- [Python documentation](https://docs.python.org/3/)
- [Django documentation](https://docs.djangoproject.com/)
- [Django custom authentication documentation](https://docs.djangoproject.com/en/6.1/topics/auth/customizing/)
- [Django admin site documentation](https://docs.djangoproject.com/en/6.1/ref/contrib/admin/)
- [Django model forms documentation](https://docs.djangoproject.com/en/6.1/topics/forms/modelforms/)
- [Django REST Framework documentation](https://www.django-rest-framework.org/)
- [django-cors-headers documentation](https://github.com/adamchainz/django-cors-headers)
- [Gunicorn documentation](https://docs.gunicorn.org/en/stable/)
- [python-dotenv documentation](https://bbc2.github.io/python-dotenv/)
- [dj-database-url documentation](https://github.com/jazzband/dj-database-url)

### Database
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Neon documentation](https://neon.tech/docs)
- [dbdiagram.io documentation](https://dbdiagram.io/docs)

### External services
- [GitHub REST API documentation](https://docs.github.com/en/rest)
- [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Cloudinary documentation](https://cloudinary.com/documentation)
- [Brevo API documentation](https://developers.brevo.com/)

### Hosting and deployment
- [Render documentation](https://render.com/docs)
- [Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)