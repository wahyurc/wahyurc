import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
// WebGL (Three.js) in headless Chromium needs ANGLE/SwiftShader
Config.setChromiumOpenGlRenderer("angle");
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setConcurrency(4);
