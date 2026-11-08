/**
 * geek-black — port of the supplied #nice stylesheet.
 * Headings retain their outer rule/rail and inner .content decoration rather
 * than flattening both boxes into one. Registered by build.mjs into the bundle.
 */
const sans = '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif';
const quoteSans = '-apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
const accent = "rgb(239, 112, 96)";

const overrides = {
  base: {
    "--md-primary-color": "#212122",
    color: "#000000"
  },
  // Match the reference's plain, numbered code blocks (no macOS traffic lights).
  renderOptions: {
    isMacCodeBlock: false,
    isShowLineNumber: true
  },
  block: {
    container: {
      padding: "30px",
      "box-sizing": "border-box"
    },
    p: {
      "box-sizing": "border-box",
      margin: "10px 0",
      "margin-bottom": "16px",
      padding: "8px 0",
      "font-family": sans,
      "font-size": "15px",
      "text-align": "start",
      "white-space": "normal",
      "text-size-adjust": "auto",
      "line-height": "1.75em",
      "letter-spacing": "normal",
      color: "#000000"
    },
    h1: {
      display: "block",
      margin: "-0.46em 0 0.1em",
      padding: "0",
      "border-bottom": "2px solid rgb(198, 196, 196)",
      "box-sizing": "border-box",
      "text-align": "start",
      "font-size": "13px"
    },
    h1_content: {
      "padding-top": "5px",
      "padding-bottom": "5px",
      color: "rgb(160, 160, 160)",
      "font-size": "13px",
      "line-height": "2",
      "box-sizing": "border-box"
    },
    h2: {
      display: "block",
      margin: "10px auto",
      padding: "0",
      height: "40px",
      background: "none",
      "background-color": "rgb(251, 251, 251)",
      "border-bottom": "1px solid rgb(246, 246, 246)",
      overflow: "hidden",
      "box-sizing": "border-box",
      "text-align": "start",
      "font-size": "16px",
      color: "#000000"
    },
    h2_content: {
      "margin-left": "-10px",
      display: "inline-block",
      width: "auto",
      height: "40px",
      "background-color": "rgb(33, 33, 34)",
      "border-bottom-right-radius": "100px",
      color: "rgb(255, 255, 255)",
      "padding-right": "30px",
      "padding-left": "30px",
      "line-height": "40px",
      "font-size": "16px"
    },
    h3: {
      display: "block",
      margin: "20px auto 5px",
      padding: "0",
      "border-left": "none",
      "border-top": "1px solid rgb(221, 221, 221)",
      "box-sizing": "border-box",
      color: "#000000"
    },
    h3_content: {
      "margin-top": "-1px",
      padding: "6px 5px 0",
      "font-size": "17px",
      "border-top": "2px solid rgb(33, 33, 34)",
      display: "inline-block",
      "line-height": "1.1"
    },
    h4: {
      display: "block",
      margin: "10px auto -1px",
      padding: "0",
      "border-top": "1px solid rgb(221, 221, 221)",
      "box-sizing": "border-box",
      color: "#000000"
    },
    h4_content: {
      "margin-top": "-1px",
      padding: "6px 5px 0",
      "font-size": "16px",
      "border-top": "2px solid rgb(33, 33, 34)",
      display: "inline-block",
      "line-height": "1.1"
    },
    blockquote: {
      "border-left": "4px solid rgb(221, 221, 221)",
      "border-radius": "0",
      background: "#f4f4f4",
      margin: "1.2em 0",
      padding: "10px 1em",
      color: "rgb(119, 119, 119)",
      quotes: "none"
    },
    blockquote_p: {
      margin: "0",
      padding: "8px 0",
      "font-size": "15px",
      "font-family": quoteSans,
      color: "rgb(119, 119, 119)",
      "line-height": "1.75em",
      "letter-spacing": "normal"
    },
    code: {
      "font-size": "14px",
      color: "#333333"
    },
    code_pre: {
      margin: "16px 0",
      background: "#f8f8f8",
      border: "1px solid #eeeeee",
      "border-radius": "0",
      "font-size": "13px"
    },
    hr: {
      border: "none",
      "border-top": "1px solid #000000",
      height: "0",
      margin: "10px 0",
      transform: "none",
      "-webkit-transform": "none"
    }
  },
  inline: {
    listitem: {
      "font-size": "15px",
      "font-family": sans,
      color: "#000000"
    },
    link: { color: accent, "border-bottom": `1px solid ${accent}` },
    wx_link: { color: accent, "border-bottom": `1px solid ${accent}` },
    codespan: { color: accent },
    // In particular, bold text inside the black h2 ribbon must remain white.
    strong: { color: "inherit" },
    footnote: { color: "#ff3502" }
  }
};

function deepMerge(base, over) {
  if (base === null || over === null || typeof base !== "object" || typeof over !== "object") return over;
  const out = { ...base };
  for (const [key, value] of Object.entries(over)) {
    out[key] = key in out ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function registerGeekBlack(themeMap, themeOptions) {
  themeMap["geek-black"] = deepMerge(themeMap.default, overrides);
  if (!themeOptions.some((option) => option.value === "geek-black")) {
    themeOptions.push({ label: "极客黑", value: "geek-black", desc: "" });
  }
}
