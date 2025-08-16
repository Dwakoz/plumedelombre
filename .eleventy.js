module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({
    "node_modules/decap-cms/dist/decap-cms.js": "admin/decap-cms.js"
  });

  eleventyConfig.addCollection("extraits", (api) =>
    api.getFilteredByGlob("content/extraits/*.{md,njk,html}")
  );

  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const txt = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = txt.split(" ");
    return words.slice(0, 70).join(" ") + (words.length > 70 ? "…" : "");
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk","html","md"]
  };
};
