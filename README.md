<div align="center">

  <img src="docs/images/clonvix-logo.png" alt="Clonvix logo" width="150">

  <h1>Clonvix</h1>

  <p>
    <strong>A full-stack web application combining a personal developer portfolio
    with a GitHub repository explorer.</strong>
  </p>

  <p>
    <strong>Discover public repositories and developers, save your favourite projects,
    follow developers and connect your GitHub account — all in one place.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white" alt="Render">
    <a href="https://clonvix.onrender.com">
      <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Clonvix-a3e635?style=for-the-badge" alt="Live Demo">
    </a>
  </p>

  <p>
    <a href="https://github.com/ColmN-Dev/Clonvix/blob/main/docs/documentation.md">Documentation</a>
    &nbsp;•&nbsp;
    <a href="https://github.com/ColmN-Dev/Clonvix">GitHub Repository</a>
    &nbsp;•&nbsp;
    <a href="https://github.com/ColmN-Dev/">Developer</a>
  </p>

  <hr>

  <p>
    <a href="#features">Features</a> •
    <a href="#technology-stack">Technology Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#running-the-application">Running the Application</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#roadmap">Roadmap</a>
  </p>

</div>

> [!IMPORTANT]
> Clonvix is currently in active development. 
> Features, functionality and the overall application are subject to change as development continues.


  <br>

  <div align="center">
    <img src="docs/images/homepage-v5-dark.png" alt="Clonvix home page" width="100%">
    <br><br>
    <img src="docs/images/search-results-v4.png" alt="Clonvix search results page" width="100%">
  </div>
  
  <br>



## Features

### Planned features

- View repository details, file trees and source code
- Register, log in and manage a Clonvix profile
- Save repositories independently of GitHub stars
- Follow Clonvix users and GitHub developers
- Connect a GitHub account and view public repositories
- Showcase ColmN-Dev projects through the Clonvix interface
- Provide About and Contact pages

### Current features

- Django backend and Vite React frontend, deployed on Render
- Custom Django user model configuration with Django admin integration.
- React Router with Home, About, ColmN-Dev and Contact pages
- Responsive header with a slide-out mobile menu, and a footer
- Light and dark theme support with a System, Light and Dark theme toggle
- Custom text selection colours that adapt to the active theme
- Backend status endpoint at `GET /api/status/`
- PostgreSQL configuration through environment variables
- Clonvix branding, theme variables and logo assets
- Dedicated `github` Django app for GitHub API integration
- GitHub API token configuration through environment variables
- Project plan, wireframes, user journeys, site map and database ERD
- GitHub repository, user and topic search through the GitHub REST API
- Server-side caching of GitHub search responses
- Repository language filtering and sorting
- Repository pagination
- Search result cards for repositories, users and topics
- Shared full-screen loading overlay for Home, Trending, repository searches and search filtering
- Redis caching for GitHub search responses and Trending results
- Trending repositories ranked by historical star growth across daily, weekly and monthly periods
- Daily repository star snapshots stored in PostgreSQL
- GitHub Actions checks for backend tests, frontend linting and frontend builds
- Scheduled GitHub Actions workflow for collecting daily repository snapshots

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS v4 |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL, Neon |
| Caching | Redis, Upstash |
| External services | GitHub REST API, Cloudinary, Brevo |
| Deployment | Render, gunicorn, WhiteNoise |
| CI/CD | GitHub Actions |
| Development | Git, GitHub, Layerbase |

## Getting started

### Prerequisites

Install the following before starting development:

- Python 3.14 or later
- Node.js and npm
- PostgreSQL, or access to a PostgreSQL database such as Neon
- Redis, or access to a Redis instance
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
DEBUG=True
SECRET_KEY=replace-with-a-local-development-key
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
REDIS_URL=replace-with-your-redis-connection-url
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
GITHUB_API_TOKEN=replace-with-a-github-personal-access-token
BREVO_API_KEY=replace-with-your-brevo-api-key
```

The database URL can be replaced with a Neon connection string when using a hosted PostgreSQL database. Set `DB_SSL=True` if the host requires SSL and the connection string does not already include it.

`REDIS_URL` should point to your Redis instance. Clonvix uses Redis for caching GitHub search responses and Trending results.

`GITHUB_API_TOKEN` is a GitHub personal access token used to authenticate API requests. Read-only access to public repository data is sufficient. Without a token, GitHub applies lower API rate limits.

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
| `REDIS_URL` | Upstash Redis connection string |
| `CLOUDINARY_URL` | Cloudinary connection details |
| `BREVO_API_KEY` | Brevo API authentication key |

## Project structure

```text
Clonvix/
├── build.sh                  # Render build script
├── docs/                     # Project planning, design and supporting documentation
├── src/
│   ├── backend/              # Django project and API
│   │   ├── accounts/         # Custom user model and accounts application
│   │   ├── config/           # Django settings and URL configuration
│   │   └── github/           # GitHub API features
│   └── frontend/             # React, TypeScript and Vite application
│       ├── public/           # Public assets and static files
│       └── src/
│           ├── assets/       # Application images and imported assets
│           ├── components/   # Reusable UI components
│           └── pages/        # Application pages and views
└── README.md
```

The structure will grow as the planned features are implemented. The more detailed current tree is maintained in [Project documentation](docs/documentation.md).

## Documentation

- [Project documentation](docs/documentation.md)
- [Project plan](docs/project-plan.md)
- [Database ERD source](docs/clonvix-erd.dbml)
- [Database ERD image](docs/clonvix-erd.png)
- [Presentation 1: Project brief](docs/presentations/presentation-01.md)
- [Presentation 2: Project brief](docs/presentations/presentation-02.md)
- [Presentation 3: Project Update](docs/presentations/presentation-03.md)
- [Presentation 4: Project Update](docs/presentations/presentation-04.md)
- [Wireframes](docs/wireframes/)
- [Project diagrams and images](docs/images/)

## Roadmap

Development is planned in the following broad stages:

1. Build repository detail pages and repository contents.
2. Add account registration, login and profile management.
3. Implement saved repositories and developer-following features.
4. Add GitHub account connection and GitHub login.
5. Complete the portfolio showcase and remaining profile features.
6. Integrate external services, including Cloudinary and Brevo.
7. Expand testing, accessibility, responsive refinements and production improvements.

The roadmap is intentionally broad and may evolve as implementation and testing reveal new requirements.