import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

type Section = 'cover' | 'foundations' | 'tokens' | 'components' | 'app-components' | 'patterns' | 'templates' | 'screens' | 'admin' | 'a11y';

interface NavigationProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const sections: { id: Section; label: string }[] = [
  { id: 'cover', label: 'Cover' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'tokens', label: 'Tokens/Variables' },
  { id: 'components', label: 'Components' },
  { id: 'app-components', label: 'Components (App)' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'templates', label: 'Templates' },
  { id: 'screens', label: 'Screens (Web)' },
  { id: 'admin', label: 'Admin Kit' },
  { id: 'a11y', label: 'A11y Notes' },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 w-64 h-screen bg-card border-r border-border overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-1">Emotional Balance</h2>
            <p className="text-sm text-muted-foreground">Design System</p>
          </div>

          <div className="space-y-1 mb-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold text-foreground">Emotional Balance DS</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border bg-card">
            <div className="p-4 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Spacer */}
      <div className="md:ml-64 pt-16 md:pt-0" />
    </>
  );
}