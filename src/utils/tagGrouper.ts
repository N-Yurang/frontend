export const normalizeTags = (tags: unknown): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags as string[];
  
  if (typeof tags === "object" && tags !== null) {
    if ("flat_tags" in tags && Array.isArray((tags as any).flat_tags)) {
      return (tags as any).flat_tags as string[];
    }
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed as string[];
      if (parsed && typeof parsed === "object" && "flat_tags" in parsed && Array.isArray(parsed.flat_tags)) {
        return parsed.flat_tags as string[];
      }
    } catch {
      // Ignore JSON parse error and try splitting
    }
    
    // Check if it's comma-separated
    if (tags.includes(",")) {
      return tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    }
    
    // Check if it's hashtag separated (e.g. "#tag1 #tag2")
    if (tags.includes("#")) {
      return tags.split("#").map((t) => t.trim()).filter((t) => t.length > 0);
    }

    return [tags.trim()];
  }
  return [];
};
