module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  return { dir:{ input:".", includes:"_includes", data:"_data", output:"_site" } };
};
