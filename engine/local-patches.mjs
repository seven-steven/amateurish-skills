/**
 * Small, checked patches to the generated doocs/md bundle. Keep CLI fixes here
 * so rebuilding cannot silently drop them. Refuse upstream drift on upgrades.
 */
function replaceOnce(source, before, after) {
  if (source.split(before).length !== 2) {
    throw new Error(`engine patch expected one match: ${before.slice(0, 100)}`);
  }
  return source.replace(before, () => after);
}

export function patchEngine(source) {
  // getStyleString is used inside double-quoted HTML attributes throughout the
  // core and its extensions. CSS font names/URLs may themselves contain quotes
  // and ampersands: escape the attribute, not the CSS or the whole HTML output.
  source = replaceOnce(source,
    'return Object.entries(style ?? {}).map(([key, value]) => `${key}: ${value}`).join(`; `);',
    `const css = Object.entries(style ?? {}).map(([key, value]) => key + ": " + value).join("; ");
  return css.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");`);

  // Optional inner heading boxes for #nice-style themes; existing themes keep
  // exactly the same heading structure when hN_content is absent.
  source = replaceOnce(source,
    'return styledContent(tag, text);',
    `// Inline the h2 strong color rule from postProcessHtml as well.
      const headingText = depth === 2
        ? text.replace(/(<strong\\b[^>]*style="[^"]*)"/g, '$1; color: inherit"')
        : text;
      const contentKey = tag + "_content";
      const content = styleMapping[contentKey]
        ? '<span class="content" ' + styles(contentKey) + '>' + headingText + '</span>'
        : headingText;
      return styledContent(tag, content);`);

  // WeChat does not preserve <style> sheets. Put the effective code layout and
  // traffic-light visibility on the elements, not only in postProcessHtml CSS.
  source = replaceOnce(source,
    'const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`;',
    'const span = `<span class="mac-sign" style="display: ${opts.isMacCodeBlock ? "flex" : "none"}; padding: 10px 14px 0;">${macCodeSvg}</span>`;');
  source = replaceOnce(source,
    'const code = `<code class="language-${lang}" ${styles(`code`)}>${highlighted}</code>`;',
    'const code = `<code class="language-${lang}" ${styles(`code`, `;display: block; white-space: ${opts.isShowLineNumber ? "normal" : "pre"}; padding: 0.5em 1em 1em; overflow-x: auto; text-indent: 0`)}>${highlighted}</code>`;');
  source = replaceOnce(source,
    'return `<pre class="hljs code__pre" ${styles(`code_pre`)}>${span}${code}</pre>`;',
    'return `<pre class="hljs code__pre" ${styles(`code_pre`, `;padding: 0`)}>${span}${code}</pre>`;');
  // The reference editor mutes line numbers with host CSS. Drafts have no
  // stylesheet, so the gutter must not inherit the code's foreground color.
  source = replaceOnce(source,
    '<section class="line-numbers" style="${lineNumberColumnStyles}">',
    '<section class="line-numbers" style="${lineNumberColumnStyles}color:#b3b3b3;">');
  return source;
}
