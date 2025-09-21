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
