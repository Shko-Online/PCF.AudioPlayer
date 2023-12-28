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

import type { Meta, StoryFn, StoryObj } from "@storybook/html";

import type { IInputs, IOutputs } from "../AudioPlayer/generated/ManifestTypes";

import { useArgs } from "@storybook/client-api";

import {
  ComponentFrameworkMockGenerator,
  StringPropertyMock,
} from "@shko.online/componentframework-mock";

import { AudioPlayer as Component } from "../AudioPlayer/index";

import "../AudioPlayer/css/AudioPlayer.css";

interface StoryArgs {
  isVisible: boolean;
  isDisabled: boolean;
  src: string;
}

export default {
  title: "Shko Online's AudioPlayer",
  argTypes: {
    src: {
      control: "text",
      name: "Source",
      table: {
        category: "Parameters",
      },
    },
    isDisabled: {
      control: "boolean",
      name: "Disabled",
      table: {
        category: "Mode",
      },
    },
    isVisible: {
      control: "boolean",
      name: "Visible",
      table: {
        category: "Mode",
      },
    },  
  },
  args: {
    isDisabled: false,
    isVisible: true,
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/FHawMcpOy3JhGwZrliGSkqH6jOybzt77ki38jUXB.mp3",
  },
  decorators: [
    (Story) => {
      var container = document.createElement("div");
      container.style.margin = "2em";
      container.style.padding = "1em";
      container.style.maxWidth = "350px";
      container.style.border = "dotted 1px";

      var storyResult = Story();
      if (typeof storyResult == "string") {
        container.innerHTML = storyResult;
      } else {
        container.appendChild(storyResult);
      }
      return container;
    },
  ],
} as Meta<StoryArgs>;

const renderGenerator = () => {
  let container: HTMLDivElement;
  let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;

  return function () {
    const [args, updateArgs] = useArgs<StoryArgs>();
    if (!container) {
      container = document.createElement("div");
      mockGenerator = new ComponentFrameworkMockGenerator(
        Component,
        {
          src: StringPropertyMock,
        },
        container
      );

      mockGenerator.context.mode.isControlDisabled = args.isDisabled;
      mockGenerator.context.mode.isVisible = args.isVisible;
      mockGenerator.context._SetCanvasItems({
        src: args.src,
      });

      mockGenerator.onOutputChanged.callsFake(() => {
        mockGenerator.context._parameters.src._Refresh();
        updateArgs({
          src: mockGenerator.context._parameters.src.raw || undefined,
        });
      });

      mockGenerator.ExecuteInit();
    }

    if (mockGenerator) {
      mockGenerator.context.mode.isVisible = args.isVisible;
      mockGenerator.context.mode.isControlDisabled = args.isDisabled;
      mockGenerator.context._parameters.src._SetValue(args.src);
      mockGenerator.ExecuteUpdateView();
    }

    return container;
  };
};

export const AudioPlayer = {
  render: renderGenerator(),
  parameters: { controls: { expanded: true } },
} as StoryObj<StoryArgs>;
