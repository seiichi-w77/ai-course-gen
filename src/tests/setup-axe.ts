/**
 * Axe-core Accessibility Testing Setup
 *
 * This file configures axe-core for accessibility testing in development mode.
 * It automatically runs accessibility checks on React components during development.
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Only run axe in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Dynamic import to avoid bundle in production
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      // Axe-core configuration
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'aria-valid-attr-value',
          enabled: true,
        },
        {
          id: 'aria-required-attr',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'image-alt',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'link-name',
          enabled: true,
        },
        {
          id: 'tabindex',
          enabled: true,
        },
      ],
    });
  });
}

export {};
