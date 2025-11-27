/**
 * Example Unit Test
 *
 * This is a sample test to verify the Vitest setup is working correctly.
 * Replace this with actual component tests.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Example component for testing
function ExampleComponent() {
  return <div>Hello, Test!</div>;
}

describe('Example Test Suite', () => {
  it('should render the example component', () => {
    render(<ExampleComponent />);
    expect(screen.getByText('Hello, Test!')).toBeInTheDocument();
  });

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });
});
