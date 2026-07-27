# Weather Analysis API

Production-ready FastAPI service for analyzing weather data, powered by OpenWeatherMap.

## Features

- **Current weather** — real-time conditions for any city
- **5-day forecast** — hourly breakdowns with precipitation probability
- **City comparison** — side-by-side weather across multiple locations
- **Trend analysis** — temperature and humidity patterns
- **Favorites** — save and manage your preferred cities
- **Caching** — Redis (production) or in-memory (development)
- **Rate limiting** — configurable per-IP request throttling
- **Mock mode** — works without an API key for development

## Quick Start

```bash
# Clone and install
cd weather-api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Run (mock mode — no API key needed)
cp .env.example .env
uvicorn app.main:app --reload

# Run with real data
echo "OPENWEATHER_API_KEY=your_key_here" >> .env
uvicorn app.main:app --reload
```

## Docker

```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/weather/current/{city}` | Current weather |
| `GET` | `/api/v1/weather/forecast/{city}` | 5-day forecast |
| `GET` | `/api/v1/weather/history/{city}?days=7` | Historical data |
| `POST` | `/api/v1/weather/compare` | Compare cities |
| `GET` | `/api/v1/weather/analysis/trends?city=London` | Temperature trends |
| `POST` | `/api/v1/favorites` | Add favorite |
| `GET` | `/api/v1/favorites` | List favorites |
| `DELETE` | `/api/v1/favorites/{id}` | Remove favorite |
| `GET` | `/health` | Health check |

## Development

```bash
# Run tests
pytest -v

# Lint
ruff check .
ruff format .

# Type check
mypy app/
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENWEATHER_API_KEY` | (empty = mock mode) | OpenWeatherMap API key |
| `DATABASE_URL` | `sqlite+aiosqlite:///./weather.db` | Database connection string |
| `REDIS_URL` | (empty = in-memory cache) | Redis connection URL |
| `DEBUG` | `false` | Enable debug mode |
| `ALLOWED_ORIGINS` | `["*"]` | CORS allowed origins |

## Project Structure

```
app/
├── main.py              # App factory, lifespan
├── config.py            # Settings via pydantic-settings
├── dependencies.py      # Dependency injection factories
├── core/                # Database, exceptions, logging, middleware
├── models/              # SQLAlchemy ORM
├── schemas/             # Pydantic v2 models
├── services/            # Business logic layer
├── routers/             # HTTP endpoint handlers
└── utils/               # Helpers
```

## Dashboard UI

A modern React dashboard built with Vite, TailwindCSS v4, and Recharts.

### Running the Dashboard

```bash
# Terminal 1 — Backend
cd weather-api
source .venv/bin/activate
uvicorn app.main:app --port 8000

# Terminal 2 — Frontend
cd weather-api/frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Screenshots

**Current Weather** — Search any city to see real-time conditions with temperature, humidity, wind speed, and visibility.

![Current Weather](screenshots/current-weather.png)

**5-Day Forecast** — Interactive area chart showing temperature and humidity trends over the next 5 days.

![Forecast](screenshots/forecast.png)

**City Comparison** — Radar chart comparing multiple cities across temperature, humidity, and wind speed.

![City Comparison](screenshots/city-comparison.png)

**Trends** — Combined bar and line chart visualizing temperature and humidity patterns with summary stats.

![Trends](screenshots/trends.png)

**Favorites** — Save your favorite cities for quick access. Click any favorite to load its weather data.

![Favorites](screenshots/favorites.png)
