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

const webpack = require('webpack');
const revision = require('child_process').execSync('git rev-parse HEAD').toString().trim();

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    devtool: false,
    mode: "production",  
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        append: `\n//# sourceMappingURL=https://sourcemaps.xrm.al/PCF/AudioPlayer/${revision}/[url]`,
        filename: '../../[name].map',
        fileContext: './'
      }),     
    ]
  };