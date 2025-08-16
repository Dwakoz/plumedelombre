module.exports = function(eleventyConfig) {
  // Static
  eleventyConfig.addPassthroughCopy("styles.css");

  // Decap CMS déplacé -> /dashboard
  eleventyConfig.addPassthroughCopy("dashboard");
  eleventyConfig.addPassthroughCopy({
    "node_modules/decap-cms/dist/decap-cms.js": "dashboard/decap-cms.js"
  });

  // Collections
  eleventyConfig.addCollection("redactions", (api) => [
    ...api.getFilteredByGlob("content/redactions/*.md"),
    ...api.getFilteredByGlob("content/extraits/*.md") // compat rétro
  ]);

  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("content/articles/*.md")
  );

  // Excerpt
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const txt = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = txt.split(" ");
    return words.slice(0, 60).join(" ") + (words.length > 60 ? "…" : "");
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk","html","md"]
  };
};
