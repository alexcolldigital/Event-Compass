const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targetFile = path.join(
  projectRoot,
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

if (!fs.existsSync(targetFile)) {
  console.error(`Expo Metro externals file not found at ${targetFile}`);
  process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');
const original = content;

if (!content.includes('function getSafeMetroModuleId')) {
  content = content.replace(
    "function getNodeExternalModuleId(fromModule, moduleId) {\n    return _path.default.relative(_path.default.dirname(fromModule), _path.default.join(METRO_EXTERNALS_FOLDER, moduleId, \"index.js\"));\n}\n",
    "function getSafeMetroModuleId(moduleId) {\n    return moduleId.replace(/^node:/, \"\").replace(/[\\/:\\\\]/g, \"_\");\n}\nfunction getNodeExternalModuleId(fromModule, moduleId) {\n    const safeModuleId = getSafeMetroModuleId(moduleId);\n    return _path.default.relative(_path.default.dirname(fromModule), _path.default.join(METRO_EXTERNALS_FOLDER, safeModuleId, \"index.js\"));\n}\n"
  );
}

if (!content.includes('function tapNodeShimContents(moduleId)')) {
  content = content.replace(
    "function tapNodeShimContents(moduleId) {\n    return `module.exports = $$require_external('node:${moduleId}');`;\n}\n",
    "function tapNodeShimContents(moduleId) {\n    const safeModuleName = moduleId.replace(/^node:/, \"\");\n    return `module.exports = $$require_external('node:${safeModuleName}');`;\n}\n"
  );
}

if (!content.includes('const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId);')) {
  content = content.replace(
    "        const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId);\n",
    "        const safeModuleId = getSafeMetroModuleId(moduleId);\n        const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, safeModuleId);\n"
  );
}

if (content !== original) {
  fs.writeFileSync(targetFile, content);
  console.log(`Patched Expo Metro externals for Windows compatibility: ${targetFile}`);
} else {
  console.log('Expo Metro externals already patched.');
}
