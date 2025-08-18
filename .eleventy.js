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

  // Filtre excerpt manquant
  eleventyConfig.addFilter("excerpt", (value) => {
    if (!value) return "";
    const text = String(value)
      .replace(/<[^>]+>/g, " ")   // retire HTML
      .replace(/\s+/g, " ")       // compresse espaces
      .trim();
    return text.length > 200 ? text.slice(0, 200).trimEnd() + "…" : text;
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
