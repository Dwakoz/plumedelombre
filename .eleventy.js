module.exports = function (eleventyConfig) {
  // Publier le CMS et les uploads
  eleventyConfig.addPassthroughCopy({ "dashboard": "dashboard" });
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
