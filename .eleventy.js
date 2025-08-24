module.exports = function (eleventyConfig) {
  // --- Filtres ---
  eleventyConfig.addFilter("date", (value, format = "yyyy-MM-dd") => {
    // Supporte "now" et Date/string
    const d = (value === "now")
      ? new Date()
      : (value instanceof Date ? value : new Date(value));

    if (Number.isNaN(d.getTime())) return "";

    // Formats simples sans dépendances externes
    if (format === "yyyy") return String(d.getFullYear());
    if (format === "yyyy-MM-dd") {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${m}-${day}`;
    }
    // Fallback: ISO
    return d.toISOString();
  });

  // --- Passthrough (conservé) ---
  eleventyConfig.addPassthroughCopy({ "dashboard": "dashboard" });
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy("styles.css");

  // --- Collections ---
  eleventyConfig.addCollection("textes", (api) =>
    api.getFilteredByGlob("./content/textes/*.md").sort((a, b) => (a.date > b.date ? 1 : -1))
  );
  eleventyConfig.addCollection("fiction", (api) =>
    api.getFilteredByGlob("./content/fiction/*.md").sort((a, b) => (a.date > b.date ? 1 : -1))
  );
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("./content/articles/*.md").sort((a, b) => (a.date > b.date ? 1 : -1))
  );
  eleventyConfig.addCollection("oeuvres", (api) =>
    api.getFilteredByGlob("./content/oeuvres/*.md").sort((a, b) => (a.date > b.date ? 1 : -1))
  );

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
