import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillBadge from './SkillBadge';
import { ProficiencyLevel } from '../../types';

describe('SkillBadge', () => {
  const defaultProps = {
    skillName: 'JavaScript',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE
  };

  it('renders skill name and proficiency level', () => {
    render(<SkillBadge {...defaultProps} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getAllByTitle(/Proficiency: Intermediate/)).toHaveLength(2); // Badge and proficiency indicator
  });

  it('shows verification indicator when skill is verified', () => {
    render(
      <SkillBadge
        {...defaultProps}
        isVerified={true}
        verifiedAt="2023-12-01T10:00:00Z"
      />
    );

    const verificationIndicator = screen.getByTitle(/Verified on/);
    expect(verificationIndicator).toBeInTheDocument();
    expect(verificationIndicator).toHaveTextContent('✓');
  });

  it('does not show verification indicator when skill is not verified', () => {
    render(<SkillBadge {...defaultProps} isVerified={false} />);

    expect(screen.queryByTitle(/Verified/)).not.toBeInTheDocument();
  });

  it('applies correct proficiency colors', () => {
    const { rerender } = render(
      <SkillBadge {...defaultProps} proficiencyLevel={ProficiencyLevel.BEGINNER} />
    );

    let badge = screen.getByText('JavaScript').closest('div');
    expect(badge).toHaveStyle({ backgroundColor: '#ffc107' });

    rerender(
      <SkillBadge {...defaultProps} proficiencyLevel={ProficiencyLevel.EXPERT} />
    );

    badge = screen.getByText('JavaScript').closest('div');
    expect(badge).toHaveStyle({ backgroundColor: '#6f42c1' });
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<SkillBadge {...defaultProps} onClick={handleClick} />);

    const badge = screen.getByText('JavaScript').closest('button');
    expect(badge).toBeInTheDocument();

    fireEvent.click(badge!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as div when no onClick is provided', () => {
    render(<SkillBadge {...defaultProps} />);

    const badge = screen.getByText('JavaScript').closest('div');
    expect(badge).toBeInTheDocument();
    expect(badge?.tagName).toBe('DIV');
  });

  it('shows correct proficiency icons', () => {
    const { rerender } = render(
      <SkillBadge {...defaultProps} proficiencyLevel={ProficiencyLevel.BEGINNER} />
    );

    const beginnerIndicators = screen.getAllByTitle(/Proficiency: Beginner/);
    const proficiencyIndicator = beginnerIndicators.find(el => el.classList.contains('proficiency-indicator'));
    expect(proficiencyIndicator).toHaveTextContent('●');

    rerender(
      <SkillBadge {...defaultProps} proficiencyLevel={ProficiencyLevel.EXPERT} />
    );

    const expertIndicators = screen.getAllByTitle(/Proficiency: Expert/);
    const expertProficiencyIndicator = expertIndicators.find(el => el.classList.contains('proficiency-indicator'));
    expect(expertProficiencyIndicator).toHaveTextContent('●●●●');
  });

  it('applies size-specific styles', () => {
    const { rerender } = render(
      <SkillBadge {...defaultProps} size="small" />
    );

    let badge = screen.getByText('JavaScript').closest('div');
    expect(badge).toHaveStyle({
      fontSize: '11px',
      padding: '4px 8px',
      borderRadius: '8px'
    });

    rerender(
      <SkillBadge {...defaultProps} size="large" />
    );

    badge = screen.getByText('JavaScript').closest('div');
    expect(badge).toHaveStyle({
      fontSize: '14px',
      padding: '8px 16px',
      borderRadius: '16px'
    });
  });

  it('includes all relevant information in tooltip', () => {
    render(
      <SkillBadge
        {...defaultProps}
        category="Technical"
        yearsOfExperience={3}
        lastUsedYear={2023}
        isVerified={true}
        verifiedAt="2023-12-01T10:00:00Z"
      />
    );

    const badge = screen.getByText('JavaScript').closest('div');
    const title = badge?.getAttribute('title');

    expect(title).toContain('Skill: JavaScript');
    expect(title).toContain('Proficiency: Intermediate');
    expect(title).toContain('Category: Technical');
    expect(title).toContain('Experience: 3 years');
    expect(title).toContain('Last used: 2023');
    expect(title).toContain('Verified:');
  });
});