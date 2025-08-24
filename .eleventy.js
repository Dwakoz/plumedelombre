// .eleventy.js — perf + garde-fous + fix "collections" réservé
const path = require("path");
const fs = require("fs");

// Minifier optionnelle
let htmlMinify = async (c) => c;
try {
  ({ minify: htmlMinify } = require("html-minifier-terser"));
} catch {
  console.warn("[warn] html-minifier-terser absent. Minification désactivée.");
}

// eleventy-img optionnelle
let Image = null;
try {
  Image = require("@11ty/eleventy-img");
} catch {
  console.warn("[warn] @11ty/eleventy-img absent. Remplacement par lazy-only.");
}

// --------- Helpers
const IMG_WIDTHS = [480, 960, 1600];
const IMG_FORMATS = ["avif", "webp", "jpeg"];
const IMG_URL_PREFIX = "/static/uploads/";

async function pictureHTML(src, alt = "", cls = "", sizes = "(max-width: 800px) 92vw, 800px") {
  const srcPath = src.startsWith("/") ? src : `/${src}`;
  const inputFile = path.join(process.cwd(), srcPath.replace(/^\//, ""));
  if (!fs.existsSync(inputFile)) return null;
  if (!Image) return null;

  const metadata = await Image(inputFile, {
    widths: IMG_WIDTHS,
    formats: IMG_FORMATS,
    outputDir: "./_site/optimized-img",
    urlPath: "/optimized-img",
    cacheOptions: { duration: "30d" },
    sharpAvifOptions: { quality: 55 },
    sharpWebpOptions: { quality: 60 },
    sharpJpegOptions: { quality: 70, mozjpeg: true }
  });

  const clsAttr = cls ? ` class="${cls}"` : "";
  const sources = Object.values(metadata)
    .filter(arr => Array.isArray(arr))
    .map(arr => {
      const { format } = arr[0];
      const srcset = arr.map(e => `${e.url} ${e.width}w`).join(", ");
      return `<source type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
    })
    .join("");

  const jpeg = metadata.jpeg[metadata.jpeg.length - 1];
  const img = `<img src="${jpeg.url}" width="${jpeg.width}" height="${jpeg.height}" alt="${alt}"${clsAttr} loading="lazy" decoding="async">`;
  return `<picture>${sources}${img}</picture>`;
}

async function rewriteImages(html) {
  const imgTagRE = /<img\s+([^>]*?)\s*src=["']([^"']+)["']([^>]*)>/gi;
  const tasks = [];
  const replacements = [];
  let m;

  while ((m = imgTagRE.exec(html)) !== null) {
    const beforeAttrs = m[1] || "";
    const src = m[2] || "";
    const afterAttrs = m[3] || "";
    const attrs = `${beforeAttrs} ${afterAttrs}`.trim();

    if (!src || /^https?:\/\//i.test(src) || /^data:/i.test(src)) continue;
    if (!src.startsWith(IMG_URL_PREFIX) && !src.startsWith("/static/")) continue;

    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";
    const classMatch = attrs.match(/\bclass=["']([^"']*)["']/i);
    const cls = classMatch ? classMatch[1] : "";

    tasks.push(
      pictureHTML(src, alt, cls).then(pic => {
        if (pic) {
          replacements.push({ original: m[0], replacement: pic });
        } else {
          const lazy = m[0]
            .replace(/\sloading=["'][^"']*["']/i, "")
            .replace(/\sdecoding=["'][^"']*["']/i, "")
            .replace(/>$/, ' loading="lazy" decoding="async">');
          replacements.push({ original: m[0], replacement: lazy });
        }
      })
    );
  }

  await Promise.all(tasks);

  let out = html;
  for (const { original, replacement } of replacements) {
    out = out.split(original).join(replacement);
  }
  return out;
}

module.exports = function (eleventyConfig) {
  // Autoriser les noms réservés dans la cascade (corrige l’erreur "collections")
  eleventyConfig.setFreezeReservedData(false);

  eleventyConfig.addPassthroughCopy({ "static": "static" });
  eleventyConfig.addPassthroughCopy({ "styles.css": "styles.css" });
  eleventyConfig.addWatchTarget("styles.css");

  eleventyConfig.addNunjucksAsyncShortcode("image", async function (src, alt = "", cls = "", sizes) {
    const html = await pictureHTML(src, alt, cls, sizes);
    return html || `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy" decoding="async">`;
  });

  eleventyConfig.addTransform("optimize-images", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return await rewriteImages(content);
    }
    return content;
  });

  eleventyConfig.addTransform("html-minify", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return await htmlMinify(content, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true
      });
    }
    return content;
  });

  return {
    templateFormats: ["njk", "md", "html"],
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
