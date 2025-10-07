import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import { TodoFilters } from './TodoFilters';
import { getStatusLabel } from '@/lib/utils';

interface TodoColumnProps {
  status: Todo['status'];
  todos: Todo[];
}

const TodoColumn: React.FC<TodoColumnProps> = ({ status, todos }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const statusLabels = {
    todo: '할 일',
    'in-progress': '진행중',
    completed: '완료',
  };

  const statusColors = {
    todo: 'border-gray-300',
    'in-progress': 'border-blue-300',
    completed: 'border-green-300',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed p-4 transition-colors ${
        statusColors[status]
      } ${isOver ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {statusLabels[status]}
        </h3>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
          {todos.length}
        </span>
      </div>
      
      <div className="space-y-3">
        <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </SortableContext>
        
        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">할 일이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TodoList: React.FC = () => {
  const {
    todos,
    filters,
    sort,
    filteredTodos,
    loadTodos,
    loadSettings,
    setFilters,
    setSort,
    updateTodo,
  } = useTodoStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadTodos();
    loadSettings();
  }, [loadTodos, loadSettings]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find(t => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTodo(null);
      return;
    }

    const todoId = active.id as string;
    const newStatus = over.id as Todo['status'];

    if (newStatus && ['todo', 'in-progress', 'completed'].includes(newStatus)) {
      updateTodo(todoId, { status: newStatus });
    }

    setActiveTodo(null);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: typeof sort) => {
    setSort(newSort);
  };

  const filteredAndSortedTodos = filteredTodos();

  // Group todos by status
  const todosByStatus = {
    todo: filteredAndSortedTodos.filter(todo => todo.status === 'todo'),
    'in-progress': filteredAndSortedTodos.filter(todo => todo.status === 'in-progress'),
    completed: filteredAndSortedTodos.filter(todo => todo.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            세예의원 피부팀 투두리스트
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            총 {filteredAndSortedTodos.length}개의 할 일
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>새 할 일</span>
        </Button>
      </div>

      {/* Filters */}
      <TodoFilters
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
      />

      {/* Todo Columns */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TodoColumn status="todo" todos={todosByStatus.todo} />
          <TodoColumn status="in-progress" todos={todosByStatus['in-progress']} />
          <TodoColumn status="completed" todos={todosByStatus.completed} />
        </div>

        <DragOverlay>
          {activeTodo ? (
            <div className="opacity-50 rotate-2 scale-105">
              <TodoItem todo={activeTodo} isDragDisabled />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Todo Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 할 일 만들기"
        size="lg"
      >
        <TodoForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};
