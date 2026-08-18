import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BurndownChart } from './BurndownChart';

describe('BurndownChart', () => {
  it('renders empty message when data is null or empty', () => {
    render(<BurndownChart data={null} />);
    expect(screen.getByText(/No burndown data recorded yet/i)).toBeInTheDocument();
  });

  it('renders empty message when burndownData array is empty', () => {
    render(<BurndownChart data={{ sprintId: 's-1', burndownData: [] }} />);
    expect(screen.getByText(/No burndown data recorded yet/i)).toBeInTheDocument();
  });

  it('renders chart container when burndown points are provided', () => {
    const mockData = {
      sprintId: 's-1',
      totalWork: 40,
      completedWork: 20,
      remainingWork: 20,
      burndownData: [
        { date: '2026-08-01', idealRemaining: 40, actualRemaining: 40, completed: 0 },
        { date: '2026-08-02', idealRemaining: 20, actualRemaining: 20, completed: 20 },
      ],
      isOnTrack: true,
    };

    const { container } = render(<BurndownChart data={mockData} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
