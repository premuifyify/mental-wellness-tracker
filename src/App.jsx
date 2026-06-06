import { Toaster }    from 'react-hot-toast';

import { ThemeProvider }   from './context/ThemeContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { ErrorBoundary }   from './components/common/ErrorBoundary.jsx';
import { Header }          from './components/layout/Header.jsx';
import { NavBar }          from './components/layout/NavBar.jsx';
import { Dashboard }       from './components/Dashboard/index.jsx';
import { CheckIn }         from './components/CheckIn/index.jsx';
import { Timeline }        from './components/Timeline/index.jsx';
import { Journal }         from './components/Journal/index.jsx';
import { Achievements }    from './components/Achievements/index.jsx';
import { VIEWS }           from './constants/index.js';

function PageRouter() {
  const { currentView } = useApp();

  return (
    <ErrorBoundary>
      {currentView === VIEWS.DASHBOARD    && <Dashboard />}
      {currentView === VIEWS.CHECKIN      && <CheckIn />}
      {currentView === VIEWS.TIMELINE     && <Timeline />}
      {currentView === VIEWS.JOURNAL      && <Journal />}
      {currentView === VIEWS.ACHIEVEMENTS && <Achievements />}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />
          <PageRouter />
          <NavBar />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              maxWidth: '360px',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
              style: {
                background: '#f0f4ff',
                color: '#312e81',
                border: '1px solid #c7d2fe',
              },
            },
            error: {
              style: {
                background: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
              },
            },
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
}
