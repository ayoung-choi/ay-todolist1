import React, { useState } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { workTemplates, createTodoFromTemplate } from '@/lib/workTemplates';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

export const QuickAddTemplates: React.FC = () => {
  const { addTodo } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTemplate = (templateIndex: number) => {
    try {
      const newTodo = createTodoFromTemplate(templateIndex);
      addTodo(newTodo);
      setIsModalOpen(false);
    } catch (error) {
      console.error('템플릿 추가 실패:', error);
      alert('템플릿 추가에 실패했습니다.');
    }
  };

  const handleAddAllTemplates = () => {
    try {
      workTemplates.forEach((_, index) => {
        const newTodo = createTodoFromTemplate(index);
        addTodo(newTodo);
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('모든 템플릿 추가 실패:', error);
      alert('템플릿 추가에 실패했습니다.');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>빠른 추가</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="업무 템플릿 빠른 추가"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              📋 세예의원 피부팀 고정 업무
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              매일 반복되는 6가지 업무를 빠르게 추가할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workTemplates.map((template, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    template.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {template.priority === 'urgent' ? '긴급' :
                     template.priority === 'high' ? '높음' :
                     template.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: template.category === '오픈업무' ? '#3B82F6' :
                                           template.category === '마감업무' ? '#EF4444' :
                                           template.category === '시술준비' ? '#10B981' :
                                           template.category === '청소정리' ? '#8B5CF6' :
                                           template.category === '재고관리' ? '#F59E0B' : '#6B7280' }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.category}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddTemplate(index)}
                  >
                    추가
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              모든 업무를 한 번에 추가할 수도 있습니다.
            </div>
            <Button
              onClick={handleAddAllTemplates}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>모든 업무 추가</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
