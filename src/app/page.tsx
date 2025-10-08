'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { TodoList } from '@/components/todo/TodoList';
import { useTodoStore } from '@/store/todoStore';
import { registerServiceWorker } from '@/lib/serviceWorker';

export default function Home() {
  const { loadSettings, settings, startNotifications, loadWeeklySchedule } = useTodoStore();

  useEffect(() => {
    // 설정 로드
    loadSettings();
    
    // Service Worker 등록 (PWA용)
    registerServiceWorker();
  }, [loadSettings]);

  useEffect(() => {
    // 알림이 활성화되어 있으면 스케줄러 시작
    if (settings.notifications?.enabled) {
      startNotifications();
    }

    // 컴포넌트 언마운트 시 정리는 필요 없음 (앱 전체에서 한 번만 실행)
  }, [settings.notifications?.enabled, startNotifications]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TodoList />
      </main>
    </div>
  );
}
