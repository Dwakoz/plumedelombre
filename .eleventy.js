module.exports = function (eleventyConfig) {
  // Assets
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });
  eleventyConfig.addPassthroughCopy({ "dashboard": "dashboard" });

  // Collections
  eleventyConfig.addCollection("textes", (c) =>
    c.getFilteredByGlob("content/textes/**/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("articles", (c) =>
    c.getFilteredByGlob("content/articles/**/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("fiction", (c) =>
    c.getFilteredByGlob("content/fiction/**/*.md").sort((a, b) => b.date - a.date)
  );
   eleventyConfig.addCollection("oeuvres", (c) =>
    c.getFilteredByGlob("content/oeuvres/**/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html", "css"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
