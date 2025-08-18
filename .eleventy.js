module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");

  // Filtres date utilisés dans index.njk
  eleventyConfig.addFilter("readableDate", (value, locale = "fr-FR", options = {}) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    const fmt = { day: "2-digit", month: "long", year: "numeric", ...options };
    return d.toLocaleDateString(locale, fmt);
  });

  eleventyConfig.addFilter("htmlDate", (value) => {
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  });

  return {
    dir: { input: ".", output: "_site" },
    templateFormats: ["njk","md","html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
};
