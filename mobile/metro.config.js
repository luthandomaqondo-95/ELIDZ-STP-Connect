const { withNativeWind } = require('nativewind/metro');
const {
    getSentryExpoConfig
} = require("@sentry/react-native/metro");

// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);

// Ensure Metro treats .hdr files as static assets.
config.resolver = config.resolver || {};
const assetExts = new Set(config.resolver.assetExts || []);
['hdr', 'obj', 'mtl'].forEach((ext) => assetExts.add(ext));
config.resolver.assetExts = Array.from(assetExts);

module.exports = withNativeWind(config, {
    input: './src/theme/global.css',
    inlineRem: 16,
});