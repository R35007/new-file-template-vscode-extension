# Input Configuration Overview

By default, variables matching the pattern \$\{input.<variableName>} will be prompted. Below are the specifics:

- **File Name**: ${input.fileName} — Not prompted, as its value is already available in input object.
- **Tags**: ${tags} — Pre Prompts a multiple-choice picker.
- **Description**: ${description} — Pre Prompts only if story is selected from input.tags. Otherwise, returns the default value.
- **Component Name**: ${input.componentName} — Since prePrompt is not set, this prompts after beforeEach hook and before processBeforeEach hook (prompts on demand if the template file content matches the prompt pattern)

### Pre-Prompted Inputs

The following inputs won't be prompted again since their values are already stored in input object:

- **File Name**: ${input.fileName}
- **Tags**: ${input.tags}
- **Component Name**: ${input.componentName}

You can directly consume these variables without the input. prefix. Ensure their values are present; otherwise, accessing them may result in errors or empty strings.

Example: 

- **File Name**: ${fileName}
- **Tags**: ${tags}
- **Description**: ${description}
- **Component Name**: ${componentName}

### JavaScript Operations with Variables

You can perform JavaScript operations on the variables within expressions, like:
${tags.sort()} ${tags[0]}

**Caution**: Ensure values are present before performing operations to avoid errors.

### Handling Prompts and Operations

- Avoid combining prompts with operations. Always ensure values are prompted or available before using them in expressions.
- First, prompt the variable, and then perform any necessary transformations or operations.

For example: 
\$\{input.name.toLowerCase()} // This won't work since it doesn't match the pattern and hasn't been prompted.

Correct approach:

1.  Prompt the variable: ${input.name}
2.  Perform operations: ${input.name.toLowerCase()}

### Case Conversion Utilities

 - ${input.componentName_toPascalCase} — Prompts componentName and converts it to PascalCase.
 - ${description_toSentenceCase} — Converts description to SentenceCase if the value exists.
 - ${_toKebabCase(componentName)} — Use a utility function for variable conversions.


This guide provides an overview of input configurations and how to effectively use them.
