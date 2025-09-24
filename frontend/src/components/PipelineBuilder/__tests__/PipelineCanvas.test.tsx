import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PipelineCanvas } from '../PipelineCanvas';

// Mock @xyflow/react to avoid DOM dependency in tests
jest.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  Panel: ({ children }: any) => <div data-testid="panel">{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: (params: any, eds: any) => eds,
  Position: { Bottom: 'bottom', Top: 'top' }
}));

describe('PipelineCanvas', () => {
  beforeEach(() => {
    localStorage.clear();
    global.alert = jest.fn();
  });

  test('renders ReactFlow container with controls', () => {
    render(<PipelineCanvas />);
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
  });

  test('renders node creation buttons', () => {
    render(<PipelineCanvas />);
    expect(screen.getByText('Add Preprocess')).toBeInTheDocument();
    expect(screen.getByText('Add ModelSearch')).toBeInTheDocument();
    expect(screen.getByText('Add Explain')).toBeInTheDocument();
  });

  test('renders save and load buttons', () => {
    render(<PipelineCanvas />);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Load')).toBeInTheDocument();
  });

  test('save button stores data in localStorage', () => {
    render(<PipelineCanvas />);
    fireEvent.click(screen.getByText('Save'));
    expect(localStorage.getItem('pipeline')).toBeTruthy();
    expect(global.alert).toHaveBeenCalledWith('Pipeline saved');
  });

  test('load button retrieves data from localStorage', () => {
    localStorage.setItem('pipeline', JSON.stringify({ nodes: [], edges: [] }));
    render(<PipelineCanvas />);
    fireEvent.click(screen.getByText('Load'));
    expect(global.alert).toHaveBeenCalledWith('Pipeline loaded');
  });
});
