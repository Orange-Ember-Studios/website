import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import Portfolio from './Portfolio.astro';
import { getAllByRole, getByRole } from '@testing-library/dom';

describe('Portfolio Gallery Component (US-02)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders a section container representing the portfolio gallery', async () => {
    const result = await container.renderToString(Portfolio);
    const div = document.createElement('div');
    div.innerHTML = result;

    // Look for a section element structured as the portfolio
    const section = getByRole(div, 'region', { name: /portfolio/i });
    expect(section).toBeInTheDocument();
  });

  it('renders project list items with thumbnail images', async () => {
    const result = await container.renderToString(Portfolio);
    const div = document.createElement('div');
    div.innerHTML = result;

    // We expect to have multiple portfolio items mapped
    const images = getAllByRole(div, 'img', { name: /project/i });
    expect(images.length).toBeGreaterThanOrEqual(1); // At least one project exists
  });
});
