import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import About from './About.astro';
import { getByRole, getByText } from '@testing-library/dom';

describe('About Us Component (US-04)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders an accessible section for About Us', async () => {
    const result = await container.renderToString(About);
    const div = document.createElement('div');
    div.innerHTML = result;

    const section = getByRole(div, 'region', { name: /about us|our story/i });
    expect(section).toBeInTheDocument();
  });

  it('contains the studio story and vision text', async () => {
    const result = await container.renderToString(About);
    const div = document.createElement('div');
    div.innerHTML = result;

    expect(getByText(div, /vision|mission|story/i)).toBeInTheDocument();
  });
});
