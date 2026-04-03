# Development Guidelines: Orange Ember Studios Website

These guidelines establish the core rules, aesthetic standards, and technical practices for developing the Orange Ember Studios website. Adhering to these rules ensures a premium, maintainable, and highly performant product.

## 1. Core Technology Stack
- **Framework:** Astro (for static-site generation, incredible performance, and zero-JS by default).
- **Styling:** **Tailwind CSS**. We will use Tailwind as our primary utility-first CSS framework for rapid and consistent styling across the application.
- **Logic:** Vanilla JavaScript / TypeScript. If complex client-side interactivity is required, we will use **Vue.js** for dynamic frontend components.
- **Testing:** Driven by TDD (See `TDD_Guidelines.md`).

## 2. Design & Aesthetic Standards (CRITICAL)
Orange Ember Studios is a premier development studio specializing in **desktop and mobile video games**, as well as **web and mobile applications**. The website MUST reflect a premium, state-of-the-art aesthetic that appeals to clients looking for high-end digital products and immersive experiences.
- **Visual Impact:** Avoid generic layouts and colors. Use harmonious, tailored color palettes (e.g., custom HSL values), elegant dark modes, and subtle gradients.
- **Dynamic & Alive:** Interfaces must respond to user interactions. Make heavy use of **hover effects, micro-animations, and smooth transitions** on buttons, cards, and links.
- **Typography:** Use modern, high-quality typography (e.g., Inter, Outfit, or standard Google Fonts). Do NOT use default browser fonts.
- **Placeholders:** Do not use generic placeholders. Use AI tools (like image generation) to create realistic demo assets if real assets are not yet available.

## 3. Styling & Tailwind CSS Rules
- **Architecture:** Use Tailwind CSS utility classes directly within Astro components for layout and styling. Custom animations or complex keyframes not covered by Tailwind can be scoped in the `<style>` tag.
- **Responsive Design:** Mobile-first approach using Tailwind's responsive modifiers (`md:`, `lg:`, etc.). The layout must fluidly adapt to all screen sizes.
- **Configuration:** Maintain color palettes, typography, and specific branding metrics inside `tailwind.config.mjs` to ensure total consistency across the project.

### Official Tailwind Setup (Vite Plugin for Astro)
According to the official [Tailwind CSS documentation](https://tailwindcss.com/docs/installation/framework-guides/astro), Tailwind is configured via its Vite plugin.
1. **Install Dependencies:** Run `npm install tailwindcss @tailwindcss/vite`
2. **Configure Vite Plugin:** In your `astro.config.mjs`, import and add the Vite plugin:
   ```javascript
   import { defineConfig } from "astro/config";
   import tailwindcss from "@tailwindcss/vite";

   export default defineConfig({
     vite: {
       plugins: [tailwindcss()],
     },
   });
   ```
3. **Import Tailwind Globally:** Create `src/styles/global.css` with the following content:
   ```css
   @import "tailwindcss";
   ```
4. **Link the Stylesheet:** Make sure to import this CSS file in your main Astro layout or components:
   ```astro
   ---
   import "../styles/global.css";
   ---
   ```

## 4. Component Architecture
- **Modularity:** Build small, reusable components (e.g., `<Button />`, `<ProjectCard />`).
- **Structure:** Every component MUST have its own dedicated folder. This directory will group the component source file (`Component.astro` or `Component.vue`) together with its test file (`Component.test.ts`). Example: `src/components/Hero/Hero.astro` and `src/components/Hero/Hero.test.ts`.
- **Naming Conventions:**
  - Astro Components/Files: `PascalCase.astro` (e.g., `HeroSection.astro`).
  - Directories: `kebab-case` (e.g., `components/ui-elements/`).
  - CSS Classes: Follow Tailwind's utility class convention. If writing custom scoped CSS, use `kebab-case`.

## 5. SEO & Accessibility (A11y) Best Practices
- **Semantic HTML:** Use proper HTML5 elements (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **Headings:** Ensure strict heading hierarchy. Only ONE `<h1>` per page.
- **Meta Tags:** Every page MUST have dynamic, accurately descriptive `<title>` and `<meta name="description">` tags.
- **Unique IDs:** Ensure all interactive elements have unique IDs for testing and accessibility linking.
- **Alt Text:** All images must include descriptive `alt` attributes.

## 6. Development Workflow
1. Look at the `docs/planning/00-Index.md` board to pick up the next `.md` User Story.
2. Move the story's status to 🟡 `in-progress`.
3. Follow the strict Red-Green-Refactor cycle from `TDD_Guidelines.md`.
4. Review against the Aesthetic Standards before considering it 🟢 `done`.
