'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-navy-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-navy-900">SiteAudit AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-navy-600 hover:text-navy-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-navy-600 hover:text-navy-900 transition-colors">
              How It Works
            </a>
            {/* <a href="#what-we-check" className="text-navy-600 hover:text-navy-900 transition-colors">
              What We Check
            </a> */}
            <a href="#faq" className="text-navy-600 hover:text-navy-900 transition-colors">
              FAQ
            </a>
            <a
              href="#audit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Audit Website
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-navy-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-200">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-navy-600 hover:text-navy-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-navy-600 hover:text-navy-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#what-we-check"
                className="text-navy-600 hover:text-navy-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                What We Check
              </a>
              <a
                href="#faq"
                className="text-navy-600 hover:text-navy-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <a
                href="#audit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Audit Website
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
