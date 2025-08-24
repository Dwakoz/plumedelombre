// .eleventy.js — patch performance plumedelombre
const path = require("path");
const fs = require("fs");
const { minify } = require("html-minifier-terser");
const Image = require("@11ty/eleventy-img");

// --------- Helpers
const IMG_WIDTHS = [480, 960, 1600];
const IMG_FORMATS = ["avif", "webp", "jpeg"];
const IMG_URL_PREFIX = "/static/uploads/"; // dossier du dépôt

async function pictureHTML(src, alt = "", cls = "", sizes = "(max-width: 800px) 92vw, 800px") {
  // Résout un chemin source local
  const srcPath = src.startsWith("/") ? src : `/${src}`;
  const inputFile = path.join(process.cwd(), srcPath.replace(/^\//, "")); // vers fichier disque

  // Si l’image n’existe pas localement, on ne touche pas au tag original
  if (!fs.existsSync(inputFile)) return null;

  // Génère dérivés
  const metadata = await Image(inputFile, {
    widths: IMG_WIDTHS,
    formats: IMG_FORMATS,
    outputDir: "./_site/optimized-img", // dossier de sortie build
    urlPath: "/optimized-img",
    cacheOptions: {
      duration: "30d",
    },
    sharpAvifOptions: { quality: 55 },
    sharpWebpOptions: { quality: 60 },
    sharpJpegOptions: { quality: 70, mozjpeg: true },
  });

  // Construit <picture>
  const clsAttr = cls ? ` class="${cls}"` : "";
  const sources = Object.values(metadata)
    .filter(arr => Array.isArray(arr))
    .map(arr => {
      const { format } = arr[0];
      const srcset = arr.map(e => `${e.url} ${e.width}w`).join(", ");
      return `<source type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
    })
    .join("");

  // Fallback <img> = plus grand JPEG
  const jpeg = metadata.jpeg[metadata.jpeg.length - 1];
  const img = `<img src="${jpeg.url}" width="${jpeg.width}" height="${jpeg.height}" alt="${alt}"${clsAttr} loading="lazy" decoding="async">`;

  return `<picture>${sources}${img}</picture>`;
}

// Remplacement non destructif des <img ...> dans un HTML
async function rewriteImages(html) {
  // Capture <img ...> avec src local
  const imgTagRE = /<img\s+([^>]*?)\s*src=["']([^"']+)["']([^>]*)>/gi;
  const tasks = [];
  const replacements = [];

  let m;
  while ((m = imgTagRE.exec(html)) !== null) {
    const beforeAttrs = m[1] || "";
    const src = m[2] || "";
    const afterAttrs = m[3] || "";
    const attrs = `${beforeAttrs} ${afterAttrs}`.trim();

    // Ignore externes et data:
    if (!src || /^https?:\/\//i.test(src) || /^data:/i.test(src)) continue;

    // Scope aux uploads du site si présent
    if (!src.startsWith(IMG_URL_PREFIX) && !src.startsWith("/static/")) continue;

    // Extrait alt et class si déjà fournis
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";

    const classMatch = attrs.match(/\bclass=["']([^"']*)["']/i);
    const cls = classMatch ? classMatch[1] : "";

    tasks.push(
      pictureHTML(src, alt, cls).then(pic => {
        if (pic) {
          replacements.push({ original: m[0], replacement: pic });
        } else {
          // Au minimum, injecter lazy/decoding si pas de génération possible
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

  // Applique remplacements
  let out = html;
  for (const { original, replacement } of replacements) {
    out = out.split(original).join(replacement);
  }
  return out;
}

module.exports = function (eleventyConfig) {
  // Copie passthrough inchangée
  eleventyConfig.addPassthroughCopy({ "static": "static" });
  eleventyConfig.addPassthroughCopy({ "styles.css": "styles.css" });
  eleventyConfig.addWatchTarget("styles.css");

  // Shortcode optionnel pour utilisation manuelle dans Nunjucks: {% image "/static/uploads/foo.jpg", "alt", "class" %}
  eleventyConfig.addNunjucksAsyncShortcode("image", async function (src, alt = "", cls = "", sizes) {
    const html = await pictureHTML(src, alt, cls, sizes);
    return html || `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy" decoding="async">`;
  });

  // Transform: optimise images + ajoute lazy/decoding par défaut
  eleventyConfig.addTransform("optimize-images", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return await rewriteImages(content);
    }
    return content;
  });

  // Transform: minification HTML
  eleventyConfig.addTransform("html-minify", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return await minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true,
      });
    }
    return content;
  });

  // Dir et formats conservateurs (adaptables si votre config diffère)
  return {
    templateFormats: ["njk", "md", "html"],
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
