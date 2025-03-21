import styled from 'styled-components';
export interface __componentName__Props {}

const Styled__componentName__ = styled.div`
  ${({ width }) => `
    width: ${width}
  `}
`;

export const __componentName__ = ($camelCaseComponentName$Props: __componentName__Props) => {
  // your component logic goes here 👇
  return <Styled__componentName__ {...$camelCaseComponentName$Props} />;
};
