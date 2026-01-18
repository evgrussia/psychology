const fs = require("fs");
const path = require("path");

const webRoot = path.resolve(__dirname, "..", "..");
const appDir = path.join(webRoot, "src", "app");
const srcDir = path.join(webRoot, "src");

const styleAllowlist = new Set([
  // Add relative paths (from apps/web) that are allowed to use style={{ ... }}
  // Example: "src/app/legacy/page.tsx"
]);

const colorAllowlist = new Set([
  // Add relative paths (from apps/web) allowed to include color literals
]);

const styleExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const colorExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

const styleRegex = /style\s*=\s*\{\{/;
const colorRegex =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\(|hsla?\(/;

function normalizePath(filePath) {
  return path.relative(webRoot, filePath).replace(/\\/g, "/");
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function scanFiles({ baseDir, extensions, allowlist, regex, label }) {
  const violations = [];

  for (const filePath of walk(baseDir)) {
    if (!extensions.has(path.extname(filePath))) continue;

    const relativePath = normalizePath(filePath);
    if (allowlist.has(relativePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (regex.test(line)) {
        violations.push({
          file: relativePath,
          line: index + 1,
          snippet: line.trim(),
        });
      }
    });
  }

  if (violations.length > 0) {
    console.error(`\n[guardrails] ${label} violations found:`);
    violations.forEach((violation) => {
      console.error(
        `- ${violation.file}:${violation.line} -> ${violation.snippet}`
      );
    });
  }

  return violations.length;
}

let totalViolations = 0;

totalViolations += scanFiles({
  baseDir: appDir,
  extensions: styleExtensions,
  allowlist: styleAllowlist,
  regex: styleRegex,
  label: "Inline style (style={{) in apps/web/src/app",
});

totalViolations += scanFiles({
  baseDir: srcDir,
  extensions: colorExtensions,
  allowlist: colorAllowlist,
  regex: colorRegex,
  label: "Color literal in apps/web/src",
});

if (totalViolations > 0) {
  process.exitCode = 1;
} else {
  console.log("[guardrails] No inline styles or color literals detected.");
}
