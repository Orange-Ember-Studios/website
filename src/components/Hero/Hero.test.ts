import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import Hero from './Hero.astro';
import { getByRole } from '@testing-library/dom';

describe('Hero Component (Landing Page)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders a primary bold heading with the studio name', async () => {
    const result = await container.renderToString(Hero);
    console.log("ASTRO HTML:", result);
    
    const div = document.createElement('div');
    div.innerHTML = result;

    const heading = getByRole(div, 'heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Validates US-01 criteria: "prominently featuring the Orange Ember Studios branding"
    expect(heading).toHaveTextContent(/Orange Ember Studios/i);
  });

  it('contains a clear Call-To-Action (CTA)', async () => {
    const result = await container.renderToString(Hero);
    
    const div = document.createElement('div');
    div.innerHTML = result;

    // We expect at least one link that directs users to view work or contact
    const cta = getByRole(div, 'link', { name: /(portfolio|contact|work)/i });
    expect(cta).toBeInTheDocument();
  });
});
