/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Hero from './Hero.astro';
import { getByRole } from '@testing-library/dom';
import { createAstroContainer, setupDOMEnvironment } from '../../test-utils';

describe('Hero Component (Landing Page)', () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it('renders a primary bold heading with the studio name', async () => {
    const result = await container.renderToString(Hero);
    
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    const heading = getByRole(div, 'heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Validates US-01 criteria: "prominently featuring the Orange Ember Studios branding"
    expect(heading).toHaveTextContent(/Orange Ember Studios/i);
  });

  it('contains a clear Call-To-Action (CTA)', async () => {
    const result = await container.renderToString(Hero);
    
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // We expect at least one link that directs users to view work or contact
    const ctas = div.querySelectorAll('a[href^="#"]');
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });
});
