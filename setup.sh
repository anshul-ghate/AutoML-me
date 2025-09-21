#!/usr/bin/env bash

# init_repo.sh: Initialize project directory structure and core files

set -e

echo "Creating project directories..."
mkdir -p app/{models,routers,services,schemas}
mkdir -p frontend
mkdir -p docs
mkdir -p tasks
mkdir -p config
mkdir -p storage/{uploads,logs}

echo "Initializing Git repository..."
git init

echo "Creating core files..."
cat > .gitignore <<EOF
env/
__pycache__/
*.pyc
.env
.DS_Store
node_modules/
build/
*.egg-info/
docker-compose.override.yml
.vscode/
EOF

cat > requirements.txt <<EOF
fastapi
uvicorn[standard]
openrouter
pydantic
python-dotenv
EOF

cat > Dockerfile <<EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

cat > docker-compose.yml <<EOF
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    env_file:
      - .env
EOF

cat > app/main.py <<EOF
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AutoML Platform API",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
EOF

cat > tasks/todo.md <<EOF
# To-Do Checklist for AutoML Platform

## 1. Project Initialization
- [ ] Create repository and initialize Git
- [ ] Set up Python virtual environment and requirements.txt
- [ ] Dockerize backend service
- [ ] Initialize React app with TypeScript

## 2. Core Backend API
- [ ] Define data-modalities API endpoints (upload structured, text, image, audio)
- [ ] Implement file ingestion & storage handlers
- [ ] Build preprocessing module stubs for each modality
- [ ] Expose OpenAPI schema

## 3. GenAI Integration
- [ ] Add OpenRouter SDK and configure connection
- [ ] Research and shortlist free OpenRouter-compatible models
- [ ] Implement provider interface using OpenRouter abstraction
- [ ] Create stub endpoints to test model queries

## 4. AutoML Workflow Engine
- [ ] Define pipeline orchestration module
- [ ] Implement basic model search (sklearn grid search)
- [ ] Stub hyperparameter tuner interface

## 5. Frontend Interface
- [ ] Build login/auth pages
- [ ] Create file upload & modality selection UI
- [ ] Develop conversational chat widget
- [ ] Scaffold visual pipeline builder canvas

## 6. Feature Engineering & Model Training
- [ ] Implement structured data cleaning & feature generation
- [ ] Add text embedding & preprocessing (tokenization)
- [ ] Add image preprocessing pipeline (resizing, augmentation stub)
- [ ] Wire backend training call

## 7. Model Evaluation & Results
- [ ] Build backend evaluation metrics endpoints
- [ ] Display evaluation charts on frontend
- [ ] Implement result export (JSON/CSV)

## 8. Security & Production Hardening
- [ ] Add JWT authentication, role-based access control
- [ ] Validate all inputs, sanitize file uploads
- [ ] Scan for secrets, enforce .gitignore patterns
- [ ] Add basic rate-limiting

## 9. CI/CD & Deployment
- [ ] Configure GitHub Actions for linting & tests
- [ ] Write basic unit tests for backend & frontend
- [ ] Build Docker Compose for local dev
- [ ] Create Kubernetes manifests (optional)

## 10. Documentation & Clean-Up
- [ ] Write API usage guide in docs/
- [ ] Populate dev.md with functions to remove before prod
- [ ] Maintain steps.md with change summary
- [ ] Review and finalize todo.md review section

---
*Review Section (to fill after execution):*
- Summary of changes made:
- Notes & next steps:
EOF

echo "Initialization complete. Review tasks/todo.md for next steps."
