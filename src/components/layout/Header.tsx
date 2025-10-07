import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                세예의원 피부팀
              </span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                투두리스트
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                설정
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
