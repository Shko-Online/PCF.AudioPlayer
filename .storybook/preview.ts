import type { Preview } from "@storybook/html";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Shko Online\'s AudioPlayer', ['Introduction', '*']],
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
