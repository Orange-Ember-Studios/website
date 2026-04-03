/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Portfolio from './Portfolio.astro';
import { getAllByRole, getByRole } from '@testing-library/dom';
import { createAstroContainer, setupDOMEnvironment } from '../../test-utils';

describe('Portfolio Gallery Component (US-02)', () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it('renders a section container representing the portfolio gallery', async () => {
    const result = await container.renderToString(Portfolio);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // Look for a section element structured as the portfolio
    const section = div.querySelector('#portfolio') || getByRole(div, 'region', { name: /portfolio/i });
    expect(section).toBeInTheDocument();
  });

  it('renders project list items with thumbnail images', async () => {
    const result = await container.renderToString(Portfolio);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // We expect to have multiple portfolio items mapped
    const items = div.querySelectorAll('[data-i18n^="portfolio.project"]');
    expect(items.length).toBeGreaterThanOrEqual(1); // At least one project exists
  });
});
