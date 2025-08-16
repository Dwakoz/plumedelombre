
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addFilter("excerpt", (content) => {
    if(!content) return "";
    const txt = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return txt.split(' ').slice(0,70).join(' ') + (txt.split(' ').length>70?'…':''); 
  });
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["njk", "html", "md"]
  };
}
