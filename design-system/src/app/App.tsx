import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Navigation } from './components/Navigation';
import { Cover } from './components/Cover';
import { Foundations } from './components/Foundations';
import { TokensVariables } from './components/TokensVariables';
import { Components } from './components/Components';
import { Patterns } from './components/Patterns';
import { Templates } from './components/Templates';
import { AdminKit } from './components/AdminKit';
import { A11yNotes } from './components/A11yNotes';
import { AppComponents } from './components/AppComponents';
import { ScreensWeb } from './components/ScreensWeb';

type Section = 'cover' | 'foundations' | 'tokens' | 'components' | 'patterns' | 'templates' | 'screens' | 'app-components' | 'admin' | 'a11y';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('cover');

  const renderSection = () => {
    switch (activeSection) {
      case 'cover':
        return <Cover />;
      case 'foundations':
        return <Foundations />;
      case 'tokens':
        return <TokensVariables />;
      case 'components':
        return <Components />;
      case 'patterns':
        return <Patterns />;
      case 'templates':
        return <Templates />;
      case 'screens':
        return <ScreensWeb />;
      case 'app-components':
        return <AppComponents />;
      case 'admin':
        return <AdminKit />;
      case 'a11y':
        return <A11yNotes />;
      default:
        return <Cover />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="md:ml-64 pt-16 md:pt-0">
          {renderSection()}
        </main>
      </div>
    </ThemeProvider>
  );
}