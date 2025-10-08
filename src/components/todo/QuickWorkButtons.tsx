import React, { useState } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { workTemplates, createTodoFromTemplate } from '@/lib/workTemplates';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';

export const QuickWorkButtons: React.FC = () => {
  const { addTodo, settings } = useTodoStore();
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // 팀원 옵션 생성
  const assigneeOptions = settings.teamMembers.map(member => ({
    value: member.name,
    label: `${member.name}${member.role ? ` (${member.role})` : ''}`,
  }));

  // 첫 번째 팀원을 기본값으로
  React.useEffect(() => {
    if (!selectedAssignee && settings.teamMembers.length > 0) {
      setSelectedAssignee(settings.teamMembers[0].name);
    }
  }, [selectedAssignee, settings.teamMembers]);

  const handleQuickAdd = (templateIndex: number) => {
    if (!selectedAssignee) {
      alert('담당자를 선택해주세요.');
      return;
    }

    try {
      const newTodo = createTodoFromTemplate(templateIndex);
      // 선택된 담당자로 변경
      newTodo.assignee = selectedAssignee;
      addTodo(newTodo);
      
      // 성공 메시지
      const workNumber = templateIndex + 1;
      alert(`✅ ${workNumber}번 업무가 추가되었습니다!`);
    } catch (error) {
      console.error('업무 추가 실패:', error);
      alert('업무 추가에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">📋</span>
          오늘의 업무를 선택하세요
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className="w-48">
            <Select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              options={assigneeOptions}
              placeholder="담당자 선택"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {workTemplates.map((template, index) => {
          const workNumber = index + 1;
          const isHelperWork = workNumber >= 7; // 7, 8번은 도움 업무
          
          return (
            <Button
              key={index}
              onClick={() => handleQuickAdd(index)}
              variant={isHelperWork ? 'secondary' : 'primary'}
              className="h-20 flex flex-col items-center justify-center relative group"
            >
              <span className="text-2xl font-bold mb-1">
                {workNumber}번
              </span>
              <span className="text-xs opacity-75">
                {isHelperWork ? '도움' : '업무'}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                  {template.title.split(':')[1]?.trim() || template.title}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>사용법:</strong> 담당자를 선택하고 오늘 맡은 업무 번호를 클릭하세요. 할 일이 자동으로 추가됩니다!
        </p>
      </div>
    </div>
  );
};
