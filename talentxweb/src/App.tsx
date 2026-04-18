import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter from './router/AppRouter';
import './styles/design-tokens.css';
import './styles/grid-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/cards.css';
import './styles/dashboard-sections.css';
import './styles/status.css';
import './styles/responsive.css';
import './styles/animations.css';
import './styles/accessibility.css';
import './App.css';
import './styles/feedback.css';
import './styles/micro-interactions.css';

import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
