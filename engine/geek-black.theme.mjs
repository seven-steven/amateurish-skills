/**
 * geek-black — builtin theme, ported from a doocs/md "#nice" custom CSS.
 * Registered into themeMap as `geek-black` (see build.mjs / engine.mjs tail).
 * Self-contained: no imports; deep-merges over themeMap.default at registration.
 */

// geek-black overrides, translated from the original #nice stylesheet
const overrides = {
  base: {
    "--md-primary-color": "#212122"
  },
  block: {
    // 段落
    p: {
      "margin-bottom": "16px",
      "margin-top": "0",
      "font-size": "15px",
      "line-height": "1.75em",
      "letter-spacing": "normal",
      "color": "#3e3e3e",
      "font-family":
        '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif'
    },
    // 一级标题：灰色小字 + 浅色下边线
    h1: {
      "display": "block",
      "text-align": "start",
      "margin": "-0.46em 0 0.1em",
      "padding": "5px 0",
      "border-bottom": "2px solid rgb(198, 196, 196)",
      "color": "rgb(160, 160, 160)",
      "font-size": "13px",
      "font-weight": "normal",
      "line-height": "2"
    },
    // 二级标题：黑色圆角块 + 白字
    h2: {
      "display": "inline-block",
      "text-align": "start",
      "margin": "10px 0",
      "padding": "0 30px",
      "height": "40px",
      "line-height": "40px",
      "font-size": "16px",
      "background": "#212122",
      "color": "#ffffff",
      "border-radius": "0 0 100px 0",
      "box-shadow": "none"
    },
    // 三级标题：顶部黑色粗线
    h3: {
      "display": "inline-block",
      "border-left": "none",
      "border-top": "2px solid #212122",
      "border-radius": "0",
      "padding": "6px 5px 0",
      "margin": "20px 8px 5px 0",
      "font-size": "17px",
      "line-height": "1.1",
      "color": "hsl(var(--foreground))"
    },
    // 四级标题：同三级，略小
    h4: {
      "display": "inline-block",
      "border-top": "2px solid #212122",
      "padding": "6px 5px 0",
      "margin": "10px 8px -1px 0",
      "font-size": "16px",
      "line-height": "1.1",
      "color": "hsl(var(--foreground))"
    },
    // 引用：灰色左边线 + 灰字
    blockquote: {
      "border-left": "4px solid rgb(221, 221, 221)",
      "border-radius": "0",
      "background": "transparent",
      "box-shadow": "none",
      "margin": "1.2em 8px",
      "padding": "1.2em 1em",
      "color": "rgb(119, 119, 119)"
    },
    blockquote_p: {
      "color": "rgb(119, 119, 119)",
      "font-size": "15px",
      "line-height": "1.75em"
    }
  },
  inline: {
    // 列表项
    listitem: {
      "font-size": "15px",
      "color": "#3e3e3e",
      "font-family":
        '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif'
    },
    // 链接
    link: {
      "color": "rgb(239, 112, 96)",
      "border-bottom": "1px solid rgb(239, 112, 96)"
    },
    // 行内代码
    codespan: {
      "color": "rgb(239, 112, 96)"
    },
    // 脚注
    footnote: {
      "color": "#ff3502"
    }
  }
};

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = k in out ? deepMerge(base[k], v) : v;
  }
  return out;
}

export function registerGeekBlack(themeMap, themeOptions) {
  themeMap["geek-black"] = deepMerge(themeMap.default, overrides);
  if (!themeOptions.some((o) => o.value === "geek-black")) {
    themeOptions.push({ label: "极客黑", value: "geek-black", desc: "" });
  }
}
