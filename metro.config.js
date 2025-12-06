// Metro configuration for Expo app in a monorepo-style setup.
// Allows importing shared code from the Next.js project (../scoreboard-next/shared).

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so changes in ../scoreboard-next are picked up.
config.watchFolders = [workspaceRoot];

// Resolve node_modules from both the app and the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Alias "shared" to the shared folder inside the Next.js app.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  shared: path.resolve(workspaceRoot, "scoreboard-next", "shared"),
};

module.exports = config;
