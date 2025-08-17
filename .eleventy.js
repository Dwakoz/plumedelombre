module.exports = function (eleventyConfig) {
  // Publier l’interface CMS et son config.yml
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  // Publier le dossier d’uploads géré par le CMS
  eleventyConfig.addPassthroughCopy({ "static": "uploads" });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
      layouts: "_includes/layouts"
    }
  };
};
