# Change Log

All notable changes to the "new-file-template" extension will be documented in this file.

## v4.3.0

 - Added - `templateIndex` and `templateFileIndex` variables to the context
 - Enhanced Output logs
 - Simplified sample template comments
 - Updated Readme doc

## v4.2.0 
 - Added - `new-file-template.settings.disableInterpolation` setting to disable any javascript expression interpolation. Use it when we need to manually do a find and replace a data text.
 - Enhanced - `Create New Sample Template` command now prompts multiple template paths (if provided in `new-file-template.settings.templatePaths` setting) to create a sample template.  
  
## v4.1.0 

 - fixed - template is generated even if times is set to 0 issue fixed
 - Added more util functions to the context
  ```ts
  showInformationMessage: typeof window.showInformationMessage;
  showErrorMessage: typeof window.showErrorMessage;
  showWarningMessage: typeof window.showWarningMessage;
  ```

## v4.0.0 🎉 BREAKING CHANGE 🚀

We've revamped the entire extension with many exciting new features and some breaking changes. For a detailed list of features and advantages, please check the [README](./README.md#features) file. Here are the breaking changes in this version:

- **Renamed:**
    - `promptAlways` to `prePrompt` in the config setting.
    - `_toCapitalizedWords` to `_toCapitalCase` in the helper method.
    - `validator` to `validateInput` in the input config setting.
    - `afterInput` to `transform` in the input config setting.

- **Removed:**
    - `new-file-template.settings.templatesPath` from settings. Please use `new-file-template.settings.templatesPaths` instead. This allows for multiple template path strings.

- **Modified:**
    - `new-file-template.settings.overwriteExistingFile` now accepts three values: `prompt`, `never`, `always` instead of a boolean value.

Enjoy the new version! 🎉✨

## v3.1.0

- Added `variables` in both `_config.json` and in `new-file-template.settings.variables` settings.
- Fixed - Generating template file even when an error occurred issue fixed.

## v3.0.0

- Removed `variables` from `_config.json`. instead assign variables inside `input`
- Removed `env` from `_config.json`. instead we can now directly access `${process.env.USERNAME}`
- Added `_toAlphaCase` and `_toNumericCase` helper methods
- Fixed helper methods of those are not removing symbols and special chars
- Code Optimized.

## v2.0.1

- Fixed the issue of creating template files even when user input is not provided.

## v2.0.0

- Updated `_config.json` schema
- Removed `inputDetails` from template `_config` and merged to `input`
- Added input validations
- Added support for input prefix and suffix
- Enhanced helper case convert methods
- Renamed few helper methods. Please check the `README.md` file.

## v1.0.0

- Initial release
