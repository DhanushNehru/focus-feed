// Evaluates an article against an array of rules
export function evaluateArticle(article, rules) {
  // If no rules, everything is visible
  if (!rules || rules.length === 0) return true;

  const title = (article.title || '').toLowerCase();
  const content = (article.content || '').toLowerCase();
  const textToSearch = `${title} ${content}`;

  let isVisible = true; // Default to true, let rules exclude it
  
  // We can have two types of rules for MVP: 'include' and 'exclude'
  // 'include' means if it exists, it MUST match AT LEAST one include rule (if any include rules exist)
  // 'exclude' means if it matches, it is HIDDEN regardless of include rules

  const includeRules = rules.filter(r => r.type === 'include');
  const excludeRules = rules.filter(r => r.type === 'exclude');

  // Check Exclusions first (fast fail)
  for (const rule of excludeRules) {
    const term = rule.value.toLowerCase();
    if (textToSearch.includes(term)) {
      return false; // Immediately hide
    }
  }

  // Check Inclusions
  if (includeRules.length > 0) {
    let matchedAnyInclude = false;
    for (const rule of includeRules) {
      const term = rule.value.toLowerCase();
      if (textToSearch.includes(term)) {
        matchedAnyInclude = true;
        break;
      }
    }
    isVisible = matchedAnyInclude;
  }

  return isVisible;
}
