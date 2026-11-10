import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './styles/index.css';
import { ThemeProvider } from './app/theme';
import { ConciergeProvider } from './concierge/ConciergeContext';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ConciergeProvider>
        <App />
      </ConciergeProvider>
    </ThemeProvider>
  </StrictMode>,
);
