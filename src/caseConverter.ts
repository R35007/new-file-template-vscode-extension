// AlphaNumeric Case -> removes any special chars and keeps only Alphabets and numbers
/** @example "Foo--123-Bar-@-Qux-Baz" = "123" */
export const _toNumericCase = (input: string = '') =>
  input
    .trim()
    .replace(/[^0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** @example "Foo--123-Bar-@-Qux-Baz" = "Foo Bar Qux Baz" */
export const _toAlphaCase = (input: string = '') =>
  input
    .trim()
    .replace(/[^a-zA-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** @example "Foo--123-Bar-@-Qux-Baz" = "Foo 123 Bar Qux Baz" */
export const _toAlphaNumericCase = (input: string = '') =>
  input
    .trim()
    .replace(/^\d+/, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// SPACE CASE -> Adds space before uppercase chars
/** @example "fooBarQuxBaz" = "Foo Bar Qux Baz" */
export const _toSpaceCase = (input: string = '') =>
  _toAlphaNumericCase(input)
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim();

// Title CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo Bar Qux Baz Foo Bar" */
export const _toTitleCase = (input: string = '') => _toSpaceCase(input).replace(/(^|\s)\S/g, (match) => match.toUpperCase());

// Camel CASE
/** @example "FooBar-Qux__Baz" = "fooBarQuxBaz" */
export const _toCamelCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase()))
    .replace(/\s+/g, '') // remove all spaces
    .trim();

// PASCAL CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FooBarQuxBazFooBar" */
export const _toPascalCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, '') // remove all spaces
    .trim();

// SNAKE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo_bar_qux_baz_foo_bar" */
export const _toSnakeCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/\s+/g, '_') // replace all spaces with underscore (_)
    .toLowerCase();

// SNAKE UPPER CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FOO_BAR_QUX_BAZ_FOO_BAR" */
export const _toSnakeUpperCase = (input: string = '') => _toSnakeCase(input).toUpperCase();

// SNAKE TITLE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo_Bar_Qux_Baz_Foo_Bar" */
export const _toSnakeTitleCase = (input: string = '') => _toTitleCase(input).replace(/\s+/g, '_'); // replace all spaces with underscore (_)

// KEBAB CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo-bar-qux-baz-foo-bar" */
export const _toKebabCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/\s+/g, '-') // replace all spaces with hyphen (-)
    .toLowerCase();

// KEBAB UPPER CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FOO-BAR-QUX-BAZ-FOO-BAR" */
export const _toKebabUpperCase = (input: string = '') => _toKebabCase(input).toUpperCase();

// KEBAB TITLE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo_Bar_Qux_Baz_Foo_Bar" */
export const _toKebabTitleCase = (input: string = '') => _toTitleCase(input).replace(/\s+/g, '-'); // replace all spaces with hyphen (-)

// DOT CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo.bar.qux.baz.foo.bar" */
export const _toDotCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/\s+/g, '.') // replace all spaces with Dot (.)
    .toLowerCase();

// DOT UPPER Case
/** @example "FooBar-Qux__Baz-fooBar" = "FOO.BAR.QUX.BAZ.FOO.BAR" */
export const _toDotUpperCase = (input: string = '') =>
  _toSpaceCase(input)
    .replace(/\s+/g, '.') // replace all spaces with Dot (.)
    .toUpperCase();

// DOT TITLE Case
/** @example "FooBar-Qux__Baz-fooBar" = "Foo.Bar.Qux.Baz.Foo.Bar" */
export const _toDotTitleCase = (input: string = '') => _toTitleCase(input).replace(/\s+/g, '.'); // replace all spaces with Dot (.)

// Sentence Case
/** @example "foo bar-qux Baz foobar" = "Foo bar-qux Baz foobar" */
export const _toSentenceCase = (input: string = '') =>
  _toAlphaNumericCase(input).charAt(0).toUpperCase() + _toAlphaNumericCase(input).slice(1);

// Capitalized Words
/** @example "foo bar-qux baz foobar" = "Foo Bar-qux Baz Foobar" */
export const _toCapitalizedWords = (input: string = '') => _toAlphaNumericCase(input).replace(/(^|\s)\S/g, (match) => match.toUpperCase());

// Studly Caps
/** @example "foo bar-qux Baz foobar" = "FoO BaR-QuX BaZ FoObAr" */
export const _toStudlyCaps = (input: string = '') =>
  _toAlphaNumericCase(input)
    .split('')
    .map((char, index) => {
      return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
    })
    .join('');

// UPPERCASE
/** @example "fooBar" = "FOOBAR" */
export const _toUpperCase = (input: string = '') => _toAlphaNumericCase(input).toUpperCase();

// lowercase
/** @example "FOOBAR" = "foobar" */
export const _toLowerCase = (input: string = '') => _toAlphaNumericCase(input).toLowerCase();
