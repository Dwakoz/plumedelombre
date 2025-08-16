module.exports = function(eleventyConfig) {
  // Fichiers copiés tels quels
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy({
    "node_modules/decap-cms/dist/decap-cms.js": "admin/decap-cms.js"
  });

  // Collection des extraits (Markdown dans content/extraits/)
  eleventyConfig.addCollection("extraits", (api) =>
    api.getFilteredByGlob("content/extraits/*.md")
  );

  // Filtre excerpt simple pour l’aperçu
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const txt = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = txt.split(" ");
    return words.slice(0, 60).join(" ") + (words.length > 60 ? "…" : "");
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk","html","md"]
  };
};
