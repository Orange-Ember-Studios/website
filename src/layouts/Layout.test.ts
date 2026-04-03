import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeEach } from 'vitest';
import Layout from './Layout.astro';

describe('Root Layout (OpenGraph Tags)', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('should include the og:logo meta tag with the correct absolute URL', async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      }
    });
    
    // Check if the og:logo tag exists and has the correct content
    const logoTagExists = result.includes('property="og:logo"');
    const expectedUrl = "https://orangeember.com/favicon.svg";
    const expectedTag = `<meta property="og:logo" content="${expectedUrl}" />`;
    
    expect(logoTagExists).toBe(true);
    expect(result).toContain(expectedTag);
  });
});
