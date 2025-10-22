"""
api_projects_teams.py - Full CRUD for Projects & Teams
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import User, Team, Project, Dataset
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Pydantic schemas
class TeamCreate(BaseModel):
    name: str
    owner_id: str

class TeamResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    team_id: Optional[str] = None
    owner_id: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dependency for DB session (adjust to your actual DB setup)
def get_db():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TEAM ENDPOINTS
@router.post("/teams", response_model=TeamResponse)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team"""
    db_team = Team(name=team.name, owner_id=team.owner_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/teams", response_model=List[TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    """List all teams"""
    return db.query(Team).all()

@router.get("/teams/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, db: Session = Depends(get_db)):
    """Get team by ID"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, "Team not found")
    return team

@router.post("/teams/{team_id}/members")
def add_team_member(team_id: str, user_id: str, db: Session = Depends(get_db)):
    """Add member to team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    if not team or not user:
        raise HTTPException(404, "Team or User not found")
    team.members.append(user)
    db.commit()
    return {"status": "success", "message": f"User {user_id} added to team {team_id}"}

# PROJECT ENDPOINTS
@router.post("/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    db_project = Project(
        name=project.name,
        description=project.description,
        team_id=project.team_id,
        owner_id=project.owner_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    return db.query(Project).filter(Project.status == 'active').all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@router.put("/projects/{project_id}")
def update_project(project_id: str, name: Optional[str] = None, description: Optional[str] = None, db: Session = Depends(get_db)):
    """Update project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    if name:
        project.name = name
    if description:
        project.description = description
    project.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "project_id": project_id}

@router.delete("/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete (archive) project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    project.status = 'archived'
    db.commit()
    return {"status": "success", "message": f"Project {project_id} archived"}
