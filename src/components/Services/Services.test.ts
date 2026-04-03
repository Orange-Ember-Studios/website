/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Services from './Services.astro';
import { getAllByRole, getByRole, getByText } from '@testing-library/dom';
import { createAstroContainer, setupDOMEnvironment } from '../../test-utils';

describe('Services Section Component (US-03)', () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it('renders a section container representing the services module', async () => {
    const result = await container.renderToString(Services);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // Look for a section element structured for accessibility
    const section = div.querySelector('#services') || getByRole(div, 'region', { name: /services/i });
    expect(section).toBeInTheDocument();
  });

  it('renders correctly categorized service cards (Web, Games, Mobile, etc.)', async () => {
    const result = await container.renderToString(Services);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // Service cards expected to use h3 for their titles
    const headings = getAllByRole(div, 'heading', { level: 3 });
    expect(headings.length).toBeGreaterThanOrEqual(3); // Expecting Branding, Games, Web

    // Verify textual content matches the agency's goals
    expect(div.textContent).toMatch(/Web|Games|Mobile|Brand|Design/i);
  });
});
