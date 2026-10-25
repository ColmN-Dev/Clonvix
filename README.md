# Clonvix

Clonvix is a full-stack web application that combines a personal developer portfolio with a GitHub repository explorer.

The project is intended to give visitors a simple way to discover public repositories and developers. Registered users will be able to save repositories, follow developers and manage a Clonvix profile. Users will also be able to connect a GitHub account to display their public repositories.

Live site: [clonvix.onrender.com](https://clonvix.onrender.com)

> **Development status:** Clonvix is currently in active development. The Django backend, React frontend, custom user model, page routing, responsive layout, project documentation, database design and Render deployment are in place. The main repository and GitHub integration features are being implemented incrementally.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Running the application](#running-the-application)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Roadmap](#roadmap)

## Features

### Planned application features

- Search and explore public GitHub repositories
- View repository details, file trees and source code
- Register, log in and manage a Clonvix profile
- Save repositories independently of GitHub stars
- Follow Clonvix users and GitHub developers
- Connect a GitHub account and view public repositories
- Showcase ColmN-Dev projects through the Clonvix interface
- Provide About and Contact pages

### Currently available

- Django backend and Vite React frontend, deployed on Render
- Custom Django user model with email login, registered in the admin
- React Router with Home, About, ColmN-Dev and Contact pages
- Responsive header with a slide-out mobile menu, and a footer
- Light and dark theme support with a System, Light and Dark theme toggle
- Backend status endpoint at `GET /api/status/`
- Initial PostgreSQL configuration through environment variables
- Initial Clonvix branding, theme variables and logo assets
- `repositories` Django app created for the GitHub API features
- GitHub API token configuration through environment variables
- Project plan, wireframes, user journeys, site map and database ERD

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS v4 |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL, Neon |
| External services | GitHub REST API, Cloudinary, Brevo |
| Deployment | Render, gunicorn, WhiteNoise |
| Development | Git and GitHub |

## Getting started

### Prerequisites

Install the following before starting development:

- Python 3.14 or later
- Node.js and npm
- PostgreSQL, or access to a PostgreSQL database such as Neon
- Git

### Clone the repository

```bash
git clone https://github.com/ColmN-Dev/Clonvix.git
cd Clonvix
```

### Set up the backend

From the repository root:

```bash
cd src/backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install the Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file in the project root with the values needed for local development:

```env
SECRET_KEY=replace-with-a-local-development-key
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/clonvix
GITHUB_API_TOKEN=replace-with-a-github-personal-access-token
```

The database URL can be replaced with a Neon connection string when using a hosted PostgreSQL database. Set `DB_SSL=True` as well if the host requires SSL and the connection string does not already include it.

`GITHUB_API_TOKEN` is a fine-grained personal access token with read-only access to public repositories and no extra permissions. Without a token, GitHub allows far fewer API requests per hour.

Apply the database migrations:

```bash
python manage.py migrate
```

### Set up the frontend

Open a second terminal from the repository root:

```bash
cd src/frontend
npm install
```

## Running the application

### Start the backend

From `src/backend`, with the virtual environment activated:

```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`. A quick check that it is running is `http://127.0.0.1:8000/api/status/`.

### Start the frontend

From `src/frontend`:

```bash
npm run dev
```

The frontend will be available at the local URL shown by Vite, normally `http://localhost:5173`.

### Frontend checks

From `src/frontend`:

```bash
npm run lint
npm run build
```

## Deployment

Clonvix runs as a single Render web service. Django serves the built React app, so the frontend and backend share one origin.

- **Build command:** `bash build.sh`
- **Start command:** `cd src/backend && gunicorn config.wsgi:application`

`build.sh` builds the React app, installs the Python dependencies, collects the static files and runs the database migrations. WhiteNoise serves the built frontend files from `/static/`, and a catch-all route in `config/urls.py` returns `index.html` so React Router pages work on refresh.

Environment variables set on Render:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key for production |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DEBUG` | Set to `False` in production |
| `GITHUB_API_TOKEN` | Production GitHub token with read-only public access |

## Project structure

```text
Clonvix/
├── build.sh              # Render build script
├── docs/                 # Project planning, design and supporting documentation
├── src/
│   ├── backend/          # Django project and API
│   │   ├── accounts/     # Custom user model and accounts application
│   │   ├── config/       # Django settings and URL configuration
│   │   └── repositories/ # GitHub API features
│   └── frontend/         # React, TypeScript and Vite application
│       └── src/
│           ├── assets/       # Logo and images
│           ├── components/   # Header, Nav, Footer and ThemeToggle
│           └── pages/        # Home, About, ColmN-Dev and Contact
└── README.md
```

The structure will grow as the planned features are implemented. The more detailed current tree is maintained in [the project documentation](docs/documentation.md).

## Documentation

- [Project documentation](docs/documentation.md)
- [Project plan](docs/project-plan.md)
- [Database ERD source](docs/clonvix-erd.dbml)
- [Database ERD image](docs/clonvix-erd.png)
- [Presentation 1: Project brief](docs/presentations/presentation-01.md)
- [Presentation 2: Project brief](docs/presentations/presentation-02.md)
- [Presentation 3: Project Update](docs/presentations/presentation-03.md)
- [Wireframes](docs/wireframes/)
- [Site map and user journey diagrams](docs/images/)

## Roadmap

Development is planned in the following broad stages:

1. Complete the application foundation and API structure.
2. Add repository discovery using the GitHub REST API.
3. Add account registration, login and profile management.
4. Add saved repositories and developer-following features.
5. Add GitHub account connection and GitHub login.
6. Build the portfolio showcase, About and Contact pages.
7. Add testing, accessibility, responsive refinements and continued production deployment.

The roadmap is intentionally broad and may change as implementation and testing reveal new requirements.