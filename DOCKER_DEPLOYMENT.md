# Docker Deployment Guide

This project includes a production-ready Docker Compose setup with nginx as a reverse proxy.

## Architecture

- **Backend**: FastAPI application running on port 8000 (internal)
- **Frontend**: React/Vite application served by nginx on port 80 (internal)
- **Nginx**: Reverse proxy on ports 80/443 (external) routing requests to backend and frontend

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured (see below)

## Setup

1. **Create a `.env` file** in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_API_BASE_URL=/
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up -d --build
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Services

- **Backend**: Available at `http://localhost/api/`
- **Frontend**: Available at `http://localhost/`
- **API Docs**: Available at `http://localhost/docs` (FastAPI Swagger UI)

## Production Considerations

1. **SSL/TLS**: Uncomment SSL configuration in `docker-compose.yml` and add certificates to `nginx/ssl/`

2. **Environment Variables**: Use a secrets management system (e.g., Docker secrets, AWS Secrets Manager) instead of `.env` files

3. **Resource Limits**: Add resource limits to services in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

4. **Database**: If you add a database, consider using a managed service or a separate database container

5. **Monitoring**: Add monitoring tools (Prometheus, Grafana) for production

6. **Backup**: Configure backups for persistent volumes

## Health Checks

All services include health checks:
- Backend: `http://localhost/health`
- Frontend: `http://localhost/health`
- Nginx: `http://localhost/health`

## Troubleshooting

- Check logs: `docker-compose logs [service-name]`
- Restart a service: `docker-compose restart [service-name]`
- Rebuild after code changes: `docker-compose up -d --build`

