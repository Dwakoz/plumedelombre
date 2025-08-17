module.exports = function (eleventyConfig) {
  // Assets
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });
  eleventyConfig.addPassthroughCopy({ "dashboard": "dashboard" });

  // Collections
  eleventyConfig.addCollection("redactions", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/redactions/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("articles", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/articles/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html", "css"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
