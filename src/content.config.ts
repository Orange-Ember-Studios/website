import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Use the new glob loader for Astro 5.0+ Content Layer
	loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().default('Orange Ember'),
		image: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { blog };
