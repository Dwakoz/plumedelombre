module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/dashboard": "dashboard" });
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
      layouts: "_includes/layouts"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html", "css", "js", "yml"]
  };
};
