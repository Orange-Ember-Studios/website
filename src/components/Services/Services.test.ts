import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import Services from './Services.astro';
import { getAllByRole, getByRole, getByText } from '@testing-library/dom';

describe('Services Section Component (US-03)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders a section container representing the services module', async () => {
    const result = await container.renderToString(Services);
    const div = document.createElement('div');
    div.innerHTML = result;

    // Look for a section element structured for accessibility
    const section = getByRole(div, 'region', { name: /our services/i });
    expect(section).toBeInTheDocument();
  });

  it('renders correctly categorized service cards (Web, Games, Mobile, etc.)', async () => {
    const result = await container.renderToString(Services);
    const div = document.createElement('div');
    div.innerHTML = result;

    // Service cards expected to use h3 for their titles
    const headings = getAllByRole(div, 'heading', { level: 3 });
    expect(headings.length).toBeGreaterThanOrEqual(3); // Expecting Branding, Games, Web

    // Verify textual content matches the agency's goals
    expect(getByText(div, /Web/i)).toBeInTheDocument();
  });
});
