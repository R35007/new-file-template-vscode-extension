module.exports = ({ componentName }) => `import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { ${componentName} } from './${componentName}';

describe('${componentName} Component', () => {
        test('should render without crashing', () => {
                render(<${componentName} />);
                const element = screen.getByTestId('${componentName}-component');
                expect(element).toBeInTheDocument();
        });

        // Add more test cases here
});`;
