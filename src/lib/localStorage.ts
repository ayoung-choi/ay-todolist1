import { Todo, AppSettings, Comment, Attachment } from '@/types/todo';

const STORAGE_KEYS = {
  TODOS: 'skin-team-todos',
  SETTINGS: 'skin-team-settings',
} as const;

// Helper functions for date serialization
const serializeDates = (obj: unknown): unknown => {
  if (obj instanceof Date) {
    return { __date: true, value: obj.toISOString() };
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeDates(value)])
    );
  }
  return obj;
};

const deserializeDates = (obj: unknown): unknown => {
  if (obj && typeof obj === 'object' && (obj as Record<string, unknown>).__date) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Date((obj as any).value);
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeDates);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deserializeDates(value)])
    );
  }
  return obj;
};

// Todo CRUD operations
export const todoStorage = {
  getAll: (): Todo[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TODOS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return deserializeDates(parsed) as Todo[];
    } catch (error) {
      console.error('Failed to load todos:', error);
      return [];
    }
  },

  save: (todos: Todo[]): void => {
    try {
      const serialized = serializeDates(todos);
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  },

  add: (todo: Todo): void => {
    const todos = todoStorage.getAll();
    todos.push(todo);
    todoStorage.save(todos);
  },

  update: (id: string, updates: Partial<Todo>): void => {
    const todos = todoStorage.getAll();
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updatedAt: new Date() };
      todoStorage.save(todos);
    }
  },

  delete: (id: string): void => {
    const todos = todoStorage.getAll();
    const filtered = todos.filter(todo => todo.id !== id);
    todoStorage.save(filtered);
  },

  getById: (id: string): Todo | undefined => {
    const todos = todoStorage.getAll();
    return todos.find(todo => todo.id === id);
  },
};

// Settings operations
export const settingsStorage = {
  get: (): AppSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        // Default settings for 세예의원 피부팀
        const defaultSettings: AppSettings = {
          teamMembers: [
            { id: '1', name: '세예', role: '팀장' },
            { id: '2', name: '에스테1', role: '에스테티션' },
            { id: '3', name: '에스테2', role: '에스테티션' },
            { id: '4', name: '실장', role: '실장' },
            { id: '5', name: '알바', role: '아르바이트' },
          ],
          categories: [
            { id: '1', name: '오픈업무', color: '#3B82F6' },
            { id: '2', name: '마감업무', color: '#EF4444' },
            { id: '3', name: '시술준비', color: '#10B981' },
            { id: '4', name: '청소정리', color: '#8B5CF6' },
            { id: '5', name: '재고관리', color: '#F59E0B' },
            { id: '6', name: '기타', color: '#6B7280' },
          ],
          notifications: {
            enabled: false,
            notifyBeforeMinutes: [30, 60],
            dailySummaryEnabled: true,
            dailySummaryTime: '09:30', // 출근 30분 전 (10:00 출근)
            soundEnabled: true,
          },
        };
        settingsStorage.set(defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(data) as AppSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {
        teamMembers: [],
        categories: [],
        notifications: {
          enabled: false,
          notifyBeforeMinutes: [30, 60],
          dailySummaryEnabled: true,
          dailySummaryTime: '09:00',
          soundEnabled: true,
        },
      };
    }
  },

  set: (settings: AppSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  updateTeamMembers: (teamMembers: AppSettings['teamMembers']): void => {
    const settings = settingsStorage.get();
    settings.teamMembers = teamMembers;
    settingsStorage.set(settings);
  },

  updateCategories: (categories: AppSettings['categories']): void => {
    const settings = settingsStorage.get();
    settings.categories = categories;
    settingsStorage.set(settings);
  },
};

// Comment operations
export const commentStorage = {
  add: (todoId: string, comment: Comment): void => {
    const todo = todoStorage.getById(todoId);
    if (todo) {
      const updatedComments = [...todo.comments, comment];
      todoStorage.update(todoId, { comments: updatedComments });
    }
  },

  update: (todoId: string, commentId: string, content: string): void => {
    const todo = todoStorage.getById(todoId);
    if (todo) {
      const updatedComments = todo.comments.map(comment =>
        comment.id === commentId ? { ...comment, content } : comment
      );
      todoStorage.update(todoId, { comments: updatedComments });
    }
  },

  delete: (todoId: string, commentId: string): void => {
    const todo = todoStorage.getById(todoId);
    if (todo) {
      const updatedComments = todo.comments.filter(comment => comment.id !== commentId);
      todoStorage.update(todoId, { comments: updatedComments });
    }
  },
};

// Attachment operations
export const attachmentStorage = {
  add: (todoId: string, attachment: Attachment): void => {
    const todo = todoStorage.getById(todoId);
    if (todo) {
      const updatedAttachments = [...todo.attachments, attachment];
      todoStorage.update(todoId, { attachments: updatedAttachments });
    }
  },

  delete: (todoId: string, attachmentId: string): void => {
    const todo = todoStorage.getById(todoId);
    if (todo) {
      const updatedAttachments = todo.attachments.filter(attachment => attachment.id !== attachmentId);
      todoStorage.update(todoId, { attachments: updatedAttachments });
    }
  },
};

// Data migration helpers (for future Supabase migration)
export const dataMigration = {
  exportAll: (): string => {
    const todos = todoStorage.getAll();
    const settings = settingsStorage.get();
    return JSON.stringify({ todos, settings }, null, 2);
  },

  importAll: (jsonData: string): boolean => {
    try {
      const { todos, settings } = JSON.parse(jsonData);
      if (todos && Array.isArray(todos)) {
        todoStorage.save(deserializeDates(todos) as Todo[]);
      }
      if (settings) {
        settingsStorage.set(settings as AppSettings);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
