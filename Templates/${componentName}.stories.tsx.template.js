module.exports = ({ componentName, _toPascalCase }) => `import type { Meta, StoryObj } from '@storybook/react';

import { ${_toPascalCase(componentName)} } from './${_toPascalCase(componentName)}';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ${_toPascalCase(componentName)}> = {
  title: 'Components/${_toPascalCase(componentName)}',
  component: ${_toPascalCase(componentName)},
  tags: ['autodocs'],
  args: {},
};

export default meta;
type Story = StoryObj<typeof ${_toPascalCase(componentName)}>;

export const FirstStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};
`;
