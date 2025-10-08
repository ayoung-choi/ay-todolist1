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

// 간단한 비프음 생성 함수
const createBeepSound = (frequency: number = 800, duration: number = 200): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.error('소리 생성 실패:', error);
  }
};

// 진동 기능
const triggerVibration = (pattern: number[] = [200, 100, 200]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

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
      icon: options.icon || '/next.svg',
      badge: options.badge || '/next.svg',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: false, // 항상 소리 활성화
    });

    // 소리 재생 (Web Audio API)
    if (!options.silent) {
      // 첫 번째 비프음
      createBeepSound(800, 300);
      
      // 두 번째 비프음 (0.4초 후)
      setTimeout(() => {
        createBeepSound(600, 200);
      }, 400);
    }

    // 진동 (모바일)
    triggerVibration([300, 150, 300]);

    // 5초 후 자동 닫기
    setTimeout(() => {
      notification.close();
    }, 5000);

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
 * 매일 요약 알림 표시 (출근 전 알림)
 */
export const showDailySummaryNotification = (todayTodoCount: number): void => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  if (todayTodoCount === 0) {
    showNotification({
      title: '🌅 세예의원 피부팀 - 출근 전 알림',
      body: `오늘 예정된 할 일이 없습니다.\n좋은 하루 되세요! 💪`,
      tag: 'daily-summary',
      requireInteraction: true,
    });
  } else {
    showNotification({
      title: '🔔 세예의원 피부팀 - 출근 30분 전',
      body: `오늘 ${todayTodoCount}개의 할 일이 있습니다.\n${timeString}에 출근하세요!`,
      tag: 'daily-summary',
      requireInteraction: true,
    });
  }
};

/**
 * 업무 알림 표시 (업무별 특화)
 */
export const showWorkNotification = (workNumber: number, workTitle: string, assignee: string): void => {
  const workEmojis = {
    1: '🧴',
    2: '🧽', 
    3: '🧻',
    4: '🧹',
    5: '🛏️',
    6: '⚡',
    7: '🤝',
    8: '🤝'
  };
  
  const emoji = workEmojis[workNumber as keyof typeof workEmojis] || '📋';
  
  showNotification({
    title: `${emoji} ${workNumber}번 업무: ${workTitle}`,
    body: `담당자: ${assignee}\n출근 후 바로 시작하세요!`,
    tag: `work-${workNumber}`,
    requireInteraction: true,
  });
};
