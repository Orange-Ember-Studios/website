import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import Navbar from './Navbar.astro';
import { getByRole, getByAltText, getByText } from '@testing-library/dom';

describe('Navbar Component (Navigation Framework)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders the navigation landmark', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;

    const nav = getByRole(div, 'navigation');
    expect(nav).toBeInTheDocument();
  });

  it('contains the official studio shield logo', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;

    const logo = getByAltText(div, /Orange Ember Shield/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Shield.svg');
  });

  it('has links to key sections (Portfolio, Services, Contact)', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;

    expect(getByText(div, /Portfolio/i)).toBeInTheDocument();
    expect(getByText(div, /Services/i)).toBeInTheDocument();
    expect(getByText(div, /About/i)).toBeInTheDocument();
    expect(getByText(div, /Work with us/i)).toBeInTheDocument();
  });

  it('renders a mobile menu button and a hidden mobile menu container', async () => {
    const result = await container.renderToString(Navbar);
    const div = document.createElement('div');
    div.innerHTML = result;

    // Check for the mobile menu button
    const mobileBtn = div.querySelector('button[aria-controls="mobile-menu"]');
    expect(mobileBtn).toBeInTheDocument();

    // Check for the mobile menu container
    const mobileMenu = div.querySelector('#mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
  });
});
