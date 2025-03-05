const beforeEach = require('./_beforeEach');

module.exports = () => ({
  beforeAll: () => {
    /* Write your operation here 👇 that runs before generating all template files */
  },
  beforeEach,
  processBeforeEach: ({ data, context }) => ({ data, context }),
  processAfterEach: ({ data, context }) => ({ data, context }),
  afterEach: (context) => {
    console.log('Sucessfully Generated: ', context.outputFile);
  } /* Write your operation here 👇 that runs after generating each template file */,
  afterAll: () => {
    /* Write your operation here 👇 that runs after generating all template files */
  },
  exclude: ['./_beforeEach.js'],
  out: 'ReactComponent',
  variables: {
    componentName: 'AppComponent', // set default input name
    foobar: '$fooBar jazQux$',
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    user: { name: 'r35007' }
  },
  inputValues: {
    // user input values will be added here. If value is present here then it will not prompt the user
    fileName: 'Index'
  },
  input: {
    tags: {
      title: 'Tag',
      placeHolder: 'Please pick a tag',
      promptAlways: true,
      canPickMany: true,
      matchOnDescription: false,
      matchOnDetail: false,
      ignoreFocusOut: false,
      options: [
        { label: 'React', description: 'React', detail: 'This is a React Component', value: 'react', picked: true },
        { label: 'Angular', description: 'Angular', detail: 'This is a Angular Component', value: 'angular' },
        { label: 'Typescript', description: 'Typescript', detail: 'This is a plain javascript project', value: 'typescript' },
        { label: 'Javascript', description: 'Javascript', detail: 'This is a typescript project', value: 'javascript' }
      ],
      afterInput: "${value?.length ? value.join(', ') : ''}", // use this if using _config.json
      transform: (value) => value?.join(', ') // always transform takes the precedence
      /* select input wont have validator, validateInput, password  */
    },
    componentName: {
      when: (context) => context.inputValues.tags?.includes('react'), // prompts only when tags includes 'react'
      value: 'AppComponent',
      promptAlways: false,
      password: false,
      ignoreFocusOut: false,
      placeHolder: 'Please provide a componentName in pascal case',
      validator: "${value?.trim().length >= 5 ? '' : 'Please Enter a minimum 5 characters'}", // use this if using _config.json
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please Enter a minimum 5 characters'), // always validateInput takes the precedence
      afterInput: "${value?.trim().length ? _toPascalCase(value) : ''}", // use this if using _config.json
      transform: (value, context) => context._toPascalCase(value) // always transform takes the precedence
      /* text input wont have matchOnDescription, matchOnDetail, canPickMany */
    }
  }
});
