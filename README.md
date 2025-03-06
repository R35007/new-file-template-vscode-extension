# New File Template

Create new file or folders from a custom Template.

<a href="https://buymeacoffee.com/r35007" target="_blank">
  <img src="https://r35007.github.io/Siva_Profile/images//buymeacoffee.png" />
</a>

### Preview

> This demonstration uses sample React component templates. However, this extension is not limited to React; it is a versatile tool that can create any template to meet various business needs.

![Image](https://github.com/user-attachments/assets/7504f6e4-8960-4a67-9a06-ea9e15ba371d)

### Usage

- Create a folder inside `./vscode/Templates`, for example: `./vscode/Templates/MyTemplate`.
- Create a new file or folder inside the `./vscode/Templates/MyTemplate` folder, for example: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`.
- Right-click any file or folder where you want to generate the file from the template and select `New File From Template`.
- You will be prompted to pick a template name and provide the necessary variables such as `${input.componentName}` and `${input.fileName}`.
- Once all inputs are provided, a new file will be generated from the selected template.


### Template Configuration

The configuration file `_config.js` demonstrates all available features for template generation. Below is a detailed explanation of each configuration option:

#### Hooks
You can include custom hooks by requiring the `_hooks.js` file. These hooks allow you to execute custom logic at different stages of the template generation process.

```javascript
const hooks = require('./_hooks');
```

- **beforeAll(context)**: Runs before generating all template files.
- **beforeEach(context)**: Runs before generating each template file.
- **processBeforeEach({ data, context })**: Runs before interpolating template data for each file.
- **processAfterEach({ data, context })**: Runs after interpolating template data for each file.
- **afterEach(context)**: Runs after generating each template file.
- **afterAll(context)**: Runs after generating all template files.

#### Output Directory
Specify the output directory for the generated files:
```javascript
out: '${workspaceFolder}/ReactComponent',
```

#### Input Values
Predefine user input values to avoid prompting:
```javascript
inputValues: {
  fileName: 'Index'
},
```

#### Variables
Define variables to be used in your templates:
```javascript
variables: {
  fileName: 'test', // This value will be ignored since it is used in inputValues.
  componentName: 'AppComponent', // Set default input value for componentName.
  foobar: '$fooBar jazQux$',
  lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  user: { name: 'r35007' }
},
```

#### Input Configurations
Configure inputs that will be prompted to the user:
```javascript
input: {
  tags: {
    title: 'Filter',
    placeHolder: 'Please pick a file type to filter',
    promptAlways: true,
    canPickMany: true,
    matchOnDescription: false,
    matchOnDetail: false,
    ignoreFocusOut: true,
    options: [
      { label: 'React', description: 'React', detail: 'This generates React component files', value: 'react', picked: true },
      { label: 'Story', description: 'Story', detail: 'This generates Storybook files', value: 'story', picked: true },
      { label: 'Test', description: 'Test', detail: 'This generates test case files', value: 'test', picked: true }
    ]
  },
  componentName: {
    when: ({ tags }) => tags?.includes('react'),
    value: 'AppComponent',
    promptAlways: false,
    password: false,
    ignoreFocusOut: true,
    placeHolder: 'Please provide a componentName in PascalCase',
    validator: "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}",
    validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'),
    afterInput: '${_toPascalCase(value)}',
    transform: (value, context) => context._toPascalCase(value)
  }
},
```

#### Prompt Template Files
Control whether to prompt the user to select individual template files:
```javascript
promptTemplateFiles: true,
```

#### Include Additional Files
Specify additional files to include in the template generation:
```javascript
include: [],
```

#### Exclude Files or Folders
Exclude specific files or folders from template generation:
```javascript
exclude: ({ tags }) => {
  const files = ['./_hooks.js'];
  const templates = {
    react: ['./${componentName}.tsx.template.js', './${camelCaseFileName}.ts.template.js'],
    test: ['./${componentName}.test.tsx.template.js'],
    story: ['./${componentName}.stories.tsx.template.js']
  };

  Object.keys(templates).forEach((key) => {
    if (!tags.includes(key)) files.push(...templates[key]);
  });

  return files;
}
```

This configuration provides a comprehensive setup for generating files from templates, allowing for customization and flexibility based on user inputs and predefined settings.

