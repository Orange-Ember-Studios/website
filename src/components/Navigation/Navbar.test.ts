/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Navbar from './Navbar.astro';
import { getByRole, getByAltText, getAllByText } from '@testing-library/dom';
import { createAstroContainer, setupDOMEnvironment } from '../../test-utils';

describe('Navbar Component (Navigation Framework)', () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it('renders the navigation landmark', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    const nav = getByRole(div, 'navigation');
    expect(nav).toBeInTheDocument();
  });

  it('contains the official studio shield logo', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    const logo = getByAltText(div, /Orange Ember Shield/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Shield.svg');
  });

  it('has links to key sections (Portfolio, Services, Contact)', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    expect(getAllByText(div, /Portfolio/i).length).toBeGreaterThan(0);
    expect(getAllByText(div, /Services/i).length).toBeGreaterThan(0);
    expect(getAllByText(div, /About/i).length).toBeGreaterThan(0);
    expect(getAllByText(div, /Work with us/i).length).toBeGreaterThan(0);
  });

  it('renders a mobile menu button and a hidden mobile menu container', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;
    document.body.appendChild(div);

    // Check for the mobile menu button
    const mobileBtn = div.querySelector('button[aria-controls="mobile-menu"]');
    expect(mobileBtn).toBeInTheDocument();

    // Check for the mobile menu container
    const mobileMenu = div.querySelector('#mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
  });
});
