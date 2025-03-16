// AlphaNumeric Case -> removes any special chars and keeps only Alphabets and numbers
/** @example "Foo--123-Bar-@-Qux-Baz" = "123" */
export const _toNumericCase = (input: string = '', { preserve = '' }: { preserve?: string } = {}) =>
  String(input)
    .trim()
    .replace(new RegExp(`[^0-9 ${preserve}]`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** @example "Foo--123-Bar-@-Qux-Baz" = "Foo Bar Qux Baz" */
export const _toAlphaCase = (input: string = '', { preserve = '' }: { preserve?: string } = {}) =>
  String(input)
    .trim()
    .replace(new RegExp(`[^a-zA-Z ${preserve}]`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** @example "Foo--123-Bar-@-Qux-Baz" = "Foo 123 Bar Qux Baz" */
export const _toAlphaNumericCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  String(input)
    .trim()
    .replace(new RegExp(`[^a-zA-Z0-9 ${preserve}]`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(startWithAlpha ? /^\d+/ : '', '');

// Splits the input string based on the specified options.
/**  @example _split("abc123def", { numeric: true, alpha: true, preserve:"'" }); */
export const _split = (
  input: string = '',
  {
    numeric = true,
    alpha = true,
    preserve,
    startWithAlpha = false
  }: { numeric?: boolean; alpha?: boolean; preserve?: string; startWithAlpha?: boolean } = {}
) => {
  if (numeric && !alpha) return _toNumericCase(input, { preserve }).split(/\s/g);
  if (!numeric && alpha) return _toAlphaCase(input, { preserve }).split(/\s/g);
  return _toAlphaNumericCase(input, { preserve, startWithAlpha }).split(/\s/g);
};

// SPACE CASE -> Adds space before uppercase chars
/** @example "fooBarQuxBaz" = "Foo Bar Qux Baz" */
export const _toSpaceCase = (
  input: string = '',
  {
    numeric = true,
    alpha = true,
    preserve = '',
    startWithAlpha = false
  }: { numeric?: boolean; alpha?: boolean; preserve?: string; startWithAlpha?: boolean } = {}
) => {
  const process = (str: string) =>
    str
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim();
  if (numeric && !alpha) return process(_toNumericCase(input, { preserve }));
  if (!numeric && alpha) return process(_toAlphaCase(input, { preserve }));
  return process(_toAlphaNumericCase(input, { preserve, startWithAlpha }));
};

// Title CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo Bar Qux Baz Foo Bar" */
export const _toTitleCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toSpaceCase(input, { preserve, startWithAlpha }).replace(/(^|\s)\S/g, (match) => match.toUpperCase());

// Camel CASE
/** @example "FooBar-Qux__Baz" = "fooBarQuxBaz" */
export const _toCamelCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase()))
    .replace(/\s+/g, '') // remove all spaces
    .trim();

// PASCAL CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FooBarQuxBazFooBar" */
export const _toPascalCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, '') // remove all spaces
    .trim();

export const _toComponentNameCase = (input: string = '') => _toPascalCase(input, { startWithAlpha: true });

// SNAKE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo_bar_qux_baz_foo_bar" */
export const _toSnakeCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/\s+/g, '_') // replace all spaces with underscore (_)
    .toLowerCase();

// SNAKE UPPER CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FOO_BAR_QUX_BAZ_FOO_BAR" */
export const _toSnakeUpperCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toSnakeCase(input, { preserve, startWithAlpha }).toUpperCase();
export const _toConstantCase = _toSnakeUpperCase;

// SNAKE TITLE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo_Bar_Qux_Baz_Foo_Bar" */
export const _toSnakeTitleCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toTitleCase(input, { preserve, startWithAlpha }).replace(/\s+/g, '_'); // replace all spaces with underscore (_)

// KEBAB CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo-bar-qux-baz-foo-bar" */
export const _toKebabCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/\s+/g, '-') // replace all spaces with hyphen (-)
    .toLowerCase();

// KEBAB UPPER CASE
/** @example "FooBar-Qux__Baz-fooBar" = "FOO-BAR-QUX-BAZ-FOO-BAR" */
export const _toKebabUpperCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toKebabCase(input, { preserve, startWithAlpha }).toUpperCase();

// KEBAB TITLE CASE
/** @example "FooBar-Qux__Baz-fooBar" = "Foo-Bar-Qux-Baz-Foo-Bar" */
export const _toKebabTitleCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toTitleCase(input, { preserve, startWithAlpha }).replace(/\s+/g, '-'); // replace all spaces with hyphen (-)
export const _toHeaderCase = _toKebabTitleCase;
export const _toTrainCase = _toKebabTitleCase;

// DOT CASE
/** @example "FooBar-Qux__Baz-fooBar" = "foo.bar.qux.baz.foo.bar" */
export const _toDotCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/\s+/g, '.') // replace all spaces with Dot (.)
    .toLowerCase();

// DOT UPPER Case
/** @example "FooBar-Qux__Baz-fooBar" = "FOO.BAR.QUX.BAZ.FOO.BAR" */
export const _toDotUpperCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toSpaceCase(input, { preserve, startWithAlpha })
    .replace(/\s+/g, '.') // replace all spaces with Dot (.)
    .toUpperCase();

// DOT TITLE Case
/** @example "FooBar-Qux__Baz-fooBar" = "Foo.Bar.Qux.Baz.Foo.Bar" */
export const _toDotTitleCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toTitleCase(input, { preserve, startWithAlpha }).replace(/\s+/g, '.'); // replace all spaces with Dot (.)

// Sentence Case
/** @example "foo bar-qux Baz foobar" = "Foo bar-qux Baz foobar" */
export const _toSentenceCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toAlphaNumericCase(input, { preserve, startWithAlpha }).charAt(0).toUpperCase() +
  _toAlphaNumericCase(input, { preserve, startWithAlpha }).slice(1);

// Capital Case
/** @example "foo bar-qux baz foobar" = "Foo Bar-qux Baz Foobar" */
export const _toCapitalCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toAlphaNumericCase(input, { preserve, startWithAlpha }).replace(/(^|\s)\S/g, (match) => match.toUpperCase());

// Studly Caps
/** @example "foo bar-qux Baz foobar" = "FoO BaR-QuX BaZ FoObAr" */
export const _toStudlyCaps = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) =>
  _toAlphaNumericCase(input, { preserve, startWithAlpha })
    .split('')
    .map((char, index) => {
      return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
    })
    .join('');

// UPPERCASE
/** @example "fooBar" = "FOOBAR" */
export const _toUpperCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toAlphaNumericCase(input, { preserve, startWithAlpha }).toUpperCase();

// lowercase
/** @example "FOOBAR" = "foobar" */
export const _toLowerCase = (
  input: string = '',
  { preserve = '', startWithAlpha = false }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toAlphaNumericCase(input, { preserve, startWithAlpha }).toLowerCase();

// lowercase
/** @example "1Foo--123-Bar-@-Qux-Baz" = "foo/123/bar/qux/baz" */
export const _toPathCase = (
  input: string = '',
  { preserve = '', startWithAlpha = true }: { preserve?: string; startWithAlpha?: boolean } = {}
) => _toAlphaNumericCase(input, { preserve, startWithAlpha }).replace(/\s+/g, '/').toLowerCase(); // replace all spaces with forward slash (/)
