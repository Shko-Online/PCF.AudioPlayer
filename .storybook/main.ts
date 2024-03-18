/*
   Copyright 2023 Betim Beja and Shko Online LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import type { StorybookConfig } from "@storybook/html-webpack5";
import path from "path";
const webpack = require("webpack");

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-babel"
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  staticDirs: ["./public"],
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    config.devtool = false;
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback["react/jsx-dev-runtime"] = path.resolve(
      "./.storybook/jsx.runtime.js"
    );
    config.resolve.fallback["react/jsx-runtime"] = path.resolve(
      "./.storybook/jsx.runtime.js"
    );
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.SourceMapDevToolPlugin({
        append: "\n//# sourceMappingURL=[url]",
        fileContext: "./",
        filename: "[file].map",
      })
    );
    return config;
  },
};
export default config;
