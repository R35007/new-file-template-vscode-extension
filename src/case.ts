// AlphaNumeric Case
export const toAlphaNumericCase = (input: string = '') => input.trim().replace(/[^a-zA-Z0-9 ]/g, '');

// Snake Case
export const toSnakeCase = (input: string = '') => input.trim().replace(/\s+/g, '_').toLowerCase();

// Camel Case
export const toCamelCase = (input: string = '') => toAlphaNumericCase(input).replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => {
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
}).replace(/\s+/g, '');

// Pascal Case
export const toPascalCase = (input: string = '') => toAlphaNumericCase(input)
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, ''); // remove more than one space

// Kebab Case
export const toKebabCase = (input: string = '') => input.trim().replace(/\s+/g, '-').toLowerCase();

// Title Case
export const toTitleCase = (input: string = '') => input.trim().replace(/(^|\s)\S/g, (match) => match.toUpperCase());

// Sentence Case
export const toSentenceCase = (input: string = '') => input.trim().charAt(0).toUpperCase() + input.trim().slice(1);

// UPPERCASE
export const toUppercase = (input: string = '') => input.trim().toUpperCase();

// lowercase
export const toLowercase = (input: string = '') => input.trim().toLowerCase();

// Capitalized Words
export const toCapitalizedWords = (input: string = '') => input.trim().replace(/(^|\s)\S/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
});

// Studly Caps
export const toStudlyCaps = (input: string = '') => input.trim().split('').map((char, index) => {
    return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
}).join('');

// Train Case
export const toTrainCase = (input: string = '') => input.trim().replace(/(^|\s)\S/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1);
}).replace(/\s+/g, '-');

// SCREAMING SNAKE CASE
export const toScreamingSnakeCase = (input: string = '') => toSnakeCase(input).toUpperCase();

// SCREAMING KEBAB CASE
export const toScreamingKebabCase = (input: string = '') => toKebabCase(input).toUpperCase();

// Dot Case
export const toDotCase = (input: string = '') => input.trim().replace(/\s+/g, '.').toLowerCase();

// Super Title Case
export const toSuperTitleCase = (input: string = '') => {
    // Remove special characters and symbols
    const cleanedString = input.replace(/[^a-zA-Z0-9\s]/g, ' ');

    // Remove multiple spaces and replace with a single space
    const formattedString = cleanedString.replace(/\s+/g, ' ');

    // Add a space before every uppercase character
    const spacedString = formattedString.replace(/([A-Z])/g, ' $1');

    // Capitalize the first letter of each word
    const titleCaseString = spacedString.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());

    return titleCaseString.trim();
};
