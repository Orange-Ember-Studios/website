/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import About from './About.astro';
import { getByRole, getAllByText } from '@testing-library/dom';
import { createAstroContainer, setupDOMEnvironment } from '../../test-utils';

describe('About Us Component (US-04)', () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it('renders an accessible section for About Us', async () => {
    const result = await container.renderToString(About);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // Check for the section by its known ID or label
    const section = div.querySelector('#about');
    expect(section).toBeInTheDocument();
    expect(section?.getAttribute('aria-label')).toMatch(/Our Story|About Us/i);
  });

  it('contains the studio story and vision text', async () => {
    const result = await container.renderToString(About);
    const div = document.createElement('div');
    div.innerHTML = result;

    // We can use getAllByText if multiples are found, or query the paragraph specifically
    const matches = getAllByText(div, /vision|mission|story/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
