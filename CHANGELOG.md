# Change Log

All notable changes to the "new-file-template" extension will be documented in this file.

## 3.7.0 - pre release. BREAKING CHANGE !

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
