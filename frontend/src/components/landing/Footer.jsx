import React from 'react';
import { Layers } from 'lucide-react';

export const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Core Capabilities', href: '#capabilities' },
        { name: 'How WorkNest Works', href: '#workflow' },
        { name: 'Role Experience', href: '#roles' },
        { name: 'Architecture Overview', href: '#operations' },
      ],
    },
    {
      title: 'Modules',
      links: [
        { name: 'Employee Directory', href: '#capabilities' },
        { name: 'Attendance & Shifts', href: '#capabilities' },
        { name: 'Leave Management', href: '#capabilities' },
        { name: 'Task Workflows', href: '#capabilities' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Platform Overview', href: '#capabilities' },
        { name: 'Architecture Guide', href: '#operations' },
        { name: 'Operations Benefits', href: '#benefits' },
        { name: 'System Status', href: '#operations' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { name: 'Workplace Operations', href: '#' },
        { name: 'Security & Access', href: '#roles' },
        { name: 'Data Governance', href: '#' },
        { name: 'Documentation', href: '#' },
      ],
    },
  ];

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="border-t border-border bg-card/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-subtle">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                WorkNest
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Employee Operations & Workplace Management Platform. Unifying staff records, attendance, leave approvals, and team tasks into a single workspace.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Platform Systems Online</span>
            </div>
          </div>

          {/* Nav columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                {section.title}
              </span>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} WorkNest. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
