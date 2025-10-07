import { create } from 'zustand';
import { Todo, TodoFilters, TodoSort, AppSettings, Comment, Attachment } from '@/types/todo';
import { todoStorage, settingsStorage, commentStorage, attachmentStorage, generateId } from '@/lib/localStorage';

interface TodoStore {
  // State
  todos: Todo[];
  settings: AppSettings;
  filters: TodoFilters;
  sort: TodoSort;
  selectedTodo: Todo | null;
  
  // Actions
  loadTodos: () => void;
  loadSettings: () => void;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  setFilters: (filters: TodoFilters) => void;
  setSort: (sort: TodoSort) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  
  // Comment actions
  addComment: (todoId: string, content: string, author: string) => void;
  updateComment: (todoId: string, commentId: string, content: string) => void;
  deleteComment: (todoId: string, commentId: string) => void;
  
  // Attachment actions
  addAttachment: (todoId: string, file: File) => Promise<void>;
  deleteAttachment: (todoId: string, attachmentId: string) => void;
  
  // Settings actions
  updateTeamMembers: (teamMembers: AppSettings['teamMembers']) => void;
  updateCategories: (categories: AppSettings['categories']) => void;
  
  // Computed values
  filteredTodos: () => Todo[];
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  // Initial state
  todos: [],
  settings: { teamMembers: [], categories: [] },
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  selectedTodo: null,

  // Load data from localStorage
  loadTodos: () => {
    const todos = todoStorage.getAll();
    set({ todos });
  },

  loadSettings: () => {
    const settings = settingsStorage.get();
    set({ settings });
  },

  // Todo CRUD operations
  addTodo: (todoData) => {
    const newTodo: Todo = {
      ...todoData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
    };
    
    todoStorage.add(newTodo);
    set(state => ({ todos: [...state.todos, newTodo] }));
  },

  updateTodo: (id, updates) => {
    todoStorage.update(id, updates);
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
      ),
      selectedTodo: state.selectedTodo?.id === id 
        ? { ...state.selectedTodo, ...updates, updatedAt: new Date() }
        : state.selectedTodo,
    }));
  },

  deleteTodo: (id) => {
    todoStorage.delete(id);
    set(state => ({
      todos: state.todos.filter(todo => todo.id !== id),
      selectedTodo: state.selectedTodo?.id === id ? null : state.selectedTodo,
    }));
  },

  // Filter and sort
  setFilters: (filters) => {
    set({ filters });
  },

  setSort: (sort) => {
    set({ sort });
  },

  setSelectedTodo: (todo) => {
    set({ selectedTodo: todo });
  },

  // Comment operations
  addComment: (todoId, content, author) => {
    const comment: Comment = {
      id: generateId(),
      author,
      content,
      createdAt: new Date(),
    };
    
    commentStorage.add(todoId, comment);
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === todoId
          ? { ...todo, comments: [...todo.comments, comment], updatedAt: new Date() }
          : todo
      ),
      selectedTodo: state.selectedTodo?.id === todoId
        ? { ...state.selectedTodo, comments: [...state.selectedTodo.comments, comment], updatedAt: new Date() }
        : state.selectedTodo,
    }));
  },

  updateComment: (todoId, commentId, content) => {
    commentStorage.update(todoId, commentId, content);
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              comments: todo.comments.map(comment =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
              updatedAt: new Date(),
            }
          : todo
      ),
      selectedTodo: state.selectedTodo?.id === todoId
        ? {
            ...state.selectedTodo,
            comments: state.selectedTodo.comments.map(comment =>
              comment.id === commentId ? { ...comment, content } : comment
            ),
            updatedAt: new Date(),
          }
        : state.selectedTodo,
    }));
  },

  deleteComment: (todoId, commentId) => {
    commentStorage.delete(todoId, commentId);
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              comments: todo.comments.filter(comment => comment.id !== commentId),
              updatedAt: new Date(),
            }
          : todo
      ),
      selectedTodo: state.selectedTodo?.id === todoId
        ? {
            ...state.selectedTodo,
            comments: state.selectedTodo.comments.filter(comment => comment.id !== commentId),
            updatedAt: new Date(),
          }
        : state.selectedTodo,
    }));
  },

  // Attachment operations
  addAttachment: async (todoId, file) => {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const attachment: Attachment = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadedAt: new Date(),
        };
        
        attachmentStorage.add(todoId, attachment);
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === todoId
              ? { ...todo, attachments: [...todo.attachments, attachment], updatedAt: new Date() }
              : todo
          ),
          selectedTodo: state.selectedTodo?.id === todoId
            ? { ...state.selectedTodo, attachments: [...state.selectedTodo.attachments, attachment], updatedAt: new Date() }
            : state.selectedTodo,
        }));
        resolve();
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  deleteAttachment: (todoId, attachmentId) => {
    attachmentStorage.delete(todoId, attachmentId);
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              attachments: todo.attachments.filter(attachment => attachment.id !== attachmentId),
              updatedAt: new Date(),
            }
          : todo
      ),
      selectedTodo: state.selectedTodo?.id === todoId
        ? {
            ...state.selectedTodo,
            attachments: state.selectedTodo.attachments.filter(attachment => attachment.id !== attachmentId),
            updatedAt: new Date(),
          }
        : state.selectedTodo,
    }));
  },

  // Settings operations
  updateTeamMembers: (teamMembers) => {
    settingsStorage.updateTeamMembers(teamMembers);
    set({ settings: { ...get().settings, teamMembers } });
  },

  updateCategories: (categories) => {
    settingsStorage.updateCategories(categories);
    set({ settings: { ...get().settings, categories } });
  },

  // Computed values
  filteredTodos: () => {
    const { todos, filters, sort } = get();
    let filtered = [...todos];

    // Apply filters
    if (filters.assignee) {
      filtered = filtered.filter(todo => todo.assignee === filters.assignee);
    }
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(todo => todo.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      // Handle priority sorting
      if (sort.field === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue];
        bValue = priorityOrder[bValue];
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },
}));
