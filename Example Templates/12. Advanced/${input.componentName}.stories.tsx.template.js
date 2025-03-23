module.exports = ({ componentName, description = '' }) => `import type { Meta, StoryObj } from '@storybook/react';

import { ${componentName} } from './${componentName}';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  args: {},
  parameters: {
    docs: {
      description: {
        component: '${description}'
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const FirstStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};
`;
