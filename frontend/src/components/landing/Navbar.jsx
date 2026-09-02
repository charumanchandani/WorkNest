import React, { useState } from 'react';
import { Layers, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks';
import { Button } from '../ui';

export const Navbar = ({ onOpenAuthPlaceholder }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Capabilities', href: '#capabilities' },
    { name: 'How It Works', href: '#workflow' },
    { name: 'Role Experience', href: '#roles' },
    { name: 'Architecture', href: '#operations' },
    { name: 'Benefits', href: '#benefits' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
          aria-label="WorkNest Home"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-subtle group-hover:bg-teal-700 transition-colors">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            WorkNest
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? Sun : Moon}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAuthPlaceholder}
          >
            Sign In
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={ArrowRight}
            onClick={onOpenAuthPlaceholder}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu & Theme Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? Sun : Moon}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthPlaceholder();
              }}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthPlaceholder();
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
