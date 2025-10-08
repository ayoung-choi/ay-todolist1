// 브라우저 알림 유틸리티 함수들

/**
 * 브라우저가 알림을 지원하는지 확인
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * 현재 알림 권한 상태 확인
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return 'denied';
  }
};

/**
 * 알림 표시 옵션
 */
export interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * 브라우저 알림 표시
 */
export const showNotification = (options: ShowNotificationOptions): Notification | null => {
  if (!isNotificationSupported()) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('알림 권한이 없습니다. 권한을 요청해주세요.');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge,
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
    });

    return notification;
  } catch (error) {
    console.error('알림 표시 실패:', error);
    return null;
  }
};

/**
 * 테스트 알림 표시
 */
export const showTestNotification = (): void => {
  showNotification({
    title: '🔔 테스트 알림',
    body: '알림이 정상적으로 작동합니다!',
    tag: 'test-notification',
  });
};

/**
 * 할 일 알림 표시
 */
export const showTodoNotification = (
  todoTitle: string,
  message: string,
  todoId: string,
  priority?: 'low' | 'medium' | 'high' | 'urgent'
): Notification | null => {
  const priorityEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴',
  };

  const emoji = priority ? priorityEmoji[priority] : '📋';

  const notification = showNotification({
    title: `${emoji} ${todoTitle}`,
    body: message,
    tag: `todo-${todoId}`,
    data: { todoId, type: 'todo-reminder' },
    requireInteraction: priority === 'urgent',
  });

  // 알림 클릭 시 해당 할 일로 이동
  if (notification) {
    notification.onclick = () => {
      window.focus();
      // 할 일 상세보기 모달을 열거나 해당 할 일로 스크롤
      const event = new CustomEvent('todo-notification-click', {
        detail: { todoId },
      });
      window.dispatchEvent(event);
      notification.close();
    };
  }

  return notification;
};

/**
 * 매일 요약 알림 표시
 */
export const showDailySummaryNotification = (todayTodoCount: number): void => {
  if (todayTodoCount === 0) {
    showNotification({
      title: '✨ 오늘의 할 일',
      body: '오늘 예정된 할 일이 없습니다. 좋은 하루 되세요!',
      tag: 'daily-summary',
    });
  } else {
    showNotification({
      title: '📋 오늘의 할 일',
      body: `오늘 ${todayTodoCount}개의 할 일이 있습니다.`,
      tag: 'daily-summary',
      requireInteraction: true,
    });
  }
};
