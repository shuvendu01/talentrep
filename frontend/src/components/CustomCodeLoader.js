'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

export default function CustomCodeLoader() {
  useEffect(() => {
    const loadCustomCode = async () => {
      try {
        const response = await api.get('/admin/custom-code/active');
        const { css, js } = response.data;

        // Inject CSS
        if (css) {
          const styleElement = document.createElement('style');
          styleElement.id = 'custom-css';
          styleElement.textContent = css;
          document.head.appendChild(styleElement);
        }

        // Inject JS
        if (js) {
          const scriptElement = document.createElement('script');
          scriptElement.id = 'custom-js';
          scriptElement.textContent = js;
          document.body.appendChild(scriptElement);
        }
      } catch (err) {
        console.error('Failed to load custom code:', err);
      }
    };

    loadCustomCode();

    // Cleanup on unmount
    return () => {
      const styleEl = document.getElementById('custom-css');
      const scriptEl = document.getElementById('custom-js');
      if (styleEl) styleEl.remove();
      if (scriptEl) scriptEl.remove();
    };
  }, []);

  return null;
}
