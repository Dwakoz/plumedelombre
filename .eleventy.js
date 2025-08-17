module.exports = function (eleventyConfig) {
  // Publier les assets nécessaires
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });
  eleventyConfig.addPassthroughCopy({ "dashboard": "dashboard" });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    // inclut CSS pour éviter qu’Eleventy l’ignore
    templateFormats: ["njk", "md", "html", "css"]
  };
};
