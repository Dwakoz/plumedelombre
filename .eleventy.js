module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({
    "node_modules/decap-cms/dist/decap-cms.js": "admin/decap-cms.js"
  });

  // Collection unifiée: lit redactions/ et l’ancien extraits/
  eleventyConfig.addCollection("redactions", (api) => [
    ...api.getFilteredByGlob("content/redactions/*.md"),
    ...api.getFilteredByGlob("content/extraits/*.md")
  ]);

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
