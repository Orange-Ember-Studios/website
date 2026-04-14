interface BlogPostMetadata {
  id: string;
  lang: string;
  tags: string[];
}

/**
 * Filters posts by language and tags, and applies pagination limit.
 */
export function getVisiblePosts(
  allPosts: BlogPostMetadata[],
  currentLang: string,
  selectedTags: Set<string>,
  limit: number
) {
  const filtered = allPosts.filter((post) => {
    // Language match
    const langMatch = post.lang === currentLang;
    
    // Tag match: if "all" is selected or no tags selected, show all for that language.
    // Otherwise, check if the post has at least one of the selected tags.
    const tagMatch =
      selectedTags.size === 0 ||
      selectedTags.has("all") ||
      Array.from(selectedTags).some((t) => post.tags.includes(t));
      
    return langMatch && tagMatch;
  });

  return {
    visiblePosts: filtered.slice(0, limit),
    totalMatching: filtered.length,
    hasMore: filtered.length > limit,
  };
}
