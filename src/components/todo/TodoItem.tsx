import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TodoForm } from './TodoForm';
import { TodoComments } from './TodoComments';
import { TodoAttachments } from './TodoAttachments';
import { cn, formatDate, formatDateTime, getPriorityColor, getStatusColor, getPriorityLabel, isOverdue } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  isDragDisabled?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, isDragDisabled = false }) => {
  const { updateTodo, deleteTodo, setSelectedTodo, settings } = useTodoStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleStatusToggle = () => {
    const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
    updateTodo(todo.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      deleteTodo(todo.id);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDetail = () => {
    setSelectedTodo(todo);
    setIsDetailModalOpen(true);
  };

  const category = settings.categories.find(cat => cat.name === todo.category);
  const assignee = settings.teamMembers.find(member => member.name === todo.assignee);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-move transition-all hover:shadow-md',
          isDragging && 'opacity-50 rotate-2 scale-105',
          todo.status === 'completed' && 'opacity-75'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={cn(
                'text-sm font-medium text-gray-900 dark:text-white truncate',
                todo.status === 'completed' && 'line-through text-gray-500'
              )}>
                {todo.title}
              </h3>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getPriorityColor(todo.priority)
              )}>
                {getPriorityLabel(todo.priority)}
              </span>
            </div>

            {todo.description && (
              <p className={cn(
                'text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2',
                todo.status === 'completed' && 'line-through'
              )}>
                {todo.description}
              </p>
            )}

            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category?.color || '#6B7280' }}
                />
                <span>{todo.category}</span>
              </div>
              <span>•</span>
              <span>{assignee?.name || todo.assignee}</span>
              {todo.dueDate && (
                <>
                  <span>•</span>
                  <span className={cn(
                    isOverdue(todo.dueDate) && todo.status !== 'completed' && 'text-red-600 font-medium'
                  )}>
                    {formatDateTime(todo.dueDate)}
                  </span>
                </>
              )}
              {(todo.comments.length > 0 || todo.attachments.length > 0) && (
                <>
                  <span>•</span>
                  <span>
                    댓글 {todo.comments.length}개
                    {todo.attachments.length > 0 && ` • 파일 ${todo.attachments.length}개`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getStatusColor(todo.status)
            )}>
              {todo.status === 'todo' && '할 일'}
              {todo.status === 'in-progress' && '진행중'}
              {todo.status === 'completed' && '완료'}
            </span>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStatusToggle}
                className="h-8 w-8 p-0"
              >
                {todo.status === 'completed' ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDetail}
                className="h-8 w-8 p-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="할 일 수정"
        size="lg"
      >
        <TodoForm
          todo={todo}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={todo.title}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">담당자</h4>
              <p className="text-sm text-gray-900 dark:text-white">{todo.assignee}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</h4>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category?.color || '#6B7280' }}
                />
                <p className="text-sm text-gray-900 dark:text-white">{todo.category}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">우선순위</h4>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getPriorityColor(todo.priority)
              )}>
                {getPriorityLabel(todo.priority)}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">마감일</h4>
              <p className="text-sm text-gray-900 dark:text-white">
                {todo.dueDate ? formatDateTime(todo.dueDate) : '설정되지 않음'}
              </p>
            </div>
          </div>

          {todo.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">설명</h4>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {todo.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodoComments todo={todo} />
            <TodoAttachments todo={todo} />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span>생성일: {formatDate(todo.createdAt)}</span>
            <span>수정일: {formatDate(todo.updatedAt)}</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
