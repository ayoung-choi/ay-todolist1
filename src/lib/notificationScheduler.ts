import { Todo } from '@/types/todo';
import { showTodoNotification, showDailySummaryNotification } from './notifications';

/**
 * 알림이 이미 표시되었는지 추적하기 위한 맵
 * key: `${todoId}-${minutesBefore}` 형식
 */
const notifiedTodos = new Set<string>();

/**
 * 마지막 일일 요약 알림 날짜 추적
 */
let lastDailySummaryDate: string | null = null;

/**
 * 두 날짜가 같은 날인지 확인
 */
const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 시간을 "HH:mm" 형식으로 포맷
 */
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * 특정 시간이 되었는지 확인 (분 단위까지)
 */
const isTimeMatch = (targetTime: string): boolean => {
  const now = new Date();
  const currentTime = formatTime(now);
  return currentTime === targetTime;
};

/**
 * 남은 시간을 사람이 읽기 쉬운 형식으로 변환
 */
const formatTimeRemaining = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${remainingMinutes}분`;
};

/**
 * 특정 할 일에 대해 알림을 보낼지 확인하고 알림 표시
 */
const checkAndNotifyTodo = (
  todo: Todo,
  minutesBefore: number,
  now: Date
): void => {
  if (!todo.dueDate || todo.status === 'completed') {
    return;
  }

  const dueDate = new Date(todo.dueDate);
  const timeDiff = dueDate.getTime() - now.getTime();
  const minutesUntilDue = Math.floor(timeDiff / (1000 * 60));

  // 정확히 설정한 시간 전에 알림 (±1분 오차 허용)
  if (Math.abs(minutesUntilDue - minutesBefore) <= 1) {
    const notificationKey = `${todo.id}-${minutesBefore}`;
    
    // 이미 알림을 보낸 경우 스킵
    if (notifiedTodos.has(notificationKey)) {
      return;
    }

    let message: string;
    if (minutesUntilDue <= 0) {
      message = '마감 시간이 지났습니다!';
    } else {
      message = `${formatTimeRemaining(minutesUntilDue)} 후 마감됩니다!`;
    }

    showTodoNotification(todo.title, message, todo.id, todo.priority);
    notifiedTodos.add(notificationKey);
    
    console.log(`알림 표시: ${todo.title} (${minutesBefore}분 전)`);
  }
};

/**
 * 모든 할 일을 확인하고 필요한 알림 표시
 */
export const checkUpcomingTodos = (
  todos: Todo[],
  notifyBeforeMinutes: number[]
): void => {
  const now = new Date();

  todos.forEach((todo) => {
    notifyBeforeMinutes.forEach((minutesBefore) => {
      checkAndNotifyTodo(todo, minutesBefore, now);
    });
  });

  // 하루가 지나면 알림 기록 초기화 (메모리 관리)
  cleanupOldNotifications(todos);
};

/**
 * 오래된 알림 기록 정리
 */
const cleanupOldNotifications = (todos: Todo[]): void => {
  const validKeys = new Set<string>();
  const now = new Date();

  todos.forEach((todo) => {
    if (todo.dueDate && todo.status !== 'completed') {
      const dueDate = new Date(todo.dueDate);
      // 마감일이 지나지 않은 할 일만 유지
      if (dueDate > now) {
        [30, 60, 1440].forEach((minutes) => {
          validKeys.add(`${todo.id}-${minutes}`);
        });
      }
    }
  });

  // 유효하지 않은 키 제거
  notifiedTodos.forEach((key) => {
    if (!validKeys.has(key)) {
      notifiedTodos.delete(key);
    }
  });
};

/**
 * 일일 요약 알림 확인 및 표시
 */
export const checkDailySummary = (
  todos: Todo[],
  summaryTime: string
): void => {
  const today = new Date().toDateString();

  // 이미 오늘 알림을 보낸 경우 스킵
  if (lastDailySummaryDate === today) {
    return;
  }

  // 설정한 시간이 되었는지 확인
  if (isTimeMatch(summaryTime)) {
    const now = new Date();
    const todayTodos = todos.filter((todo) => {
      if (!todo.dueDate || todo.status === 'completed') {
        return false;
      }
      const dueDate = new Date(todo.dueDate);
      return isSameDate(dueDate, now);
    });

    showDailySummaryNotification(todayTodos.length);
    lastDailySummaryDate = today;
    
    console.log(`일일 요약 알림 표시: 오늘 할 일 ${todayTodos.length}개`);
  }
};

/**
 * 알림 스케줄러 초기화 및 시작
 */
export const startNotificationScheduler = (
  getTodos: () => Todo[],
  getNotificationSettings: () => { enabled: boolean; notifyBeforeMinutes: number[]; dailySummaryEnabled: boolean; dailySummaryTime: string }
): number => {
  console.log('알림 스케줄러 시작');

  // 1분마다 확인
  const intervalId = window.setInterval(() => {
    const settings = getNotificationSettings();

    if (!settings.enabled) {
      return;
    }

    const todos = getTodos();

    // 마감일 알림 확인
    if (settings.notifyBeforeMinutes.length > 0) {
      checkUpcomingTodos(todos, settings.notifyBeforeMinutes);
    }

    // 일일 요약 알림 확인
    if (settings.dailySummaryEnabled && settings.dailySummaryTime) {
      checkDailySummary(todos, settings.dailySummaryTime);
    }
  }, 60000); // 60초 = 1분

  return intervalId;
};

/**
 * 알림 스케줄러 중지
 */
export const stopNotificationScheduler = (intervalId: number): void => {
  clearInterval(intervalId);
  console.log('알림 스케줄러 중지');
};

/**
 * 알림 기록 초기화 (테스트용)
 */
export const resetNotificationHistory = (): void => {
  notifiedTodos.clear();
  lastDailySummaryDate = null;
  console.log('알림 기록 초기화');
};
