export function highlightCode(code: string): string {
  if (!code) return "";
  
  // Escape HTML characters
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight Comments
  const comments: string[] = [];
  escaped = escaped.replace(/(\/\/.*)/g, (match) => {
    comments.push(match);
    return `__COMMENT_PLACEHOLDER_${comments.length - 1}__`;
  });

  // Highlight Strings (handling single quotes, double quotes, and backticks)
  const strings: string[] = [];
  escaped = escaped.replace(/(["'`])(.*?)\1/g, (match) => {
    strings.push(match);
    return `__STRING_PLACEHOLDER_${strings.length - 1}__`;
  });

  // Highlight Keywords
  const keywords = [
    "import", "from", "const", "let", "var", "async", "await", "function", 
    "class", "export", "default", "new", "return", "describe", "test", "it", 
    "expect", "as", "true", "false", "null", "undefined", "try", "catch"
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  escaped = escaped.replace(keywordRegex, '<span class="text-[#f43f5e] font-semibold">$1</span>');

  // Highlight Methods / Core Objects
  const methods = [
    "page", "cy", "goto", "visit", "click", "fill", "type", "press", "selectOption",
    "getByRole", "getByText", "getByLabel", "getByPlaceholder", "getByTestId", "getByTitle", "getByAltText",
    "toBeVisible", "toHaveURL", "toBeEnabled", "toBeDisabled", "toContainText", "toHaveText",
    "get", "contains", "should", "intercept", "wait", "request", "route"
  ];
  const methodRegex = new RegExp(`\\b(${methods.join("|")})\\b`, "g");
  escaped = escaped.replace(methodRegex, '<span class="text-[#ef4444] font-medium">$1</span>');

  // Highlight Numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-[#fbbf24]">$1</span>');

  // Restore Strings
  escaped = escaped.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (_, index) => {
    const original = strings[parseInt(index, 10)];
    return `<span class="text-[#f97316]">${original}</span>`;
  });

  // Restore Comments
  escaped = escaped.replace(/__COMMENT_PLACEHOLDER_(\d+)__/g, (_, index) => {
    const original = comments[parseInt(index, 10)];
    return `<span class="text-[#71717a] italic font-normal">${original}</span>`;
  });

  return escaped;
}
