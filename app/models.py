"""
models.py - Database Models for Projects & Teams
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Table, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

# Association table for team members
team_members = Table(
    'team_members',
    Base.metadata,
    Column('team_id', String, ForeignKey('teams.id')),
    Column('user_id', String, ForeignKey('users.id'))
)

# Association table for project collaborators
project_collaborators = Table(
    'project_collaborators',
    Base.metadata,
    Column('project_id', String, ForeignKey('projects.id')),
    Column('user_id', String, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    teams = relationship('Team', secondary=team_members, back_populates='members')
    projects = relationship('Project', secondary=project_collaborators, back_populates='collaborators')

class Team(Base):
    __tablename__ = 'teams'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    members = relationship('User', secondary=team_members, back_populates='teams')
    projects = relationship('Project', back_populates='team')

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String)
    team_id = Column(String, ForeignKey('teams.id'), nullable=True)
    owner_id = Column(String, ForeignKey('users.id'))
    status = Column(String, default='active')  # active, archived, deleted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(JSON, default={})
    
    team = relationship('Team', back_populates='projects')
    collaborators = relationship('User', secondary=project_collaborators, back_populates='projects')
    datasets = relationship('Dataset', back_populates='project')
    models = relationship('MLModel', back_populates='project')

class Dataset(Base):
    __tablename__ = 'datasets'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('projects.id'))
    name = Column(String, nullable=False)
    file_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    size_bytes = Column(String)
    metadata = Column(JSON, default={})
    
    project = relationship('Project', back_populates='datasets')

class MLModel(Base):
    __tablename__ = 'ml_models'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('projects.id'))
    name = Column(String, nullable=False)
    algorithm = Column(String)
    accuracy = Column(String)
    trained_at = Column(DateTime, default=datetime.utcnow)
    model_path = Column(String)
    metadata = Column(JSON, default={})
    
    project = relationship('Project', back_populates='models')
