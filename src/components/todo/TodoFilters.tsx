import React, { useState } from 'react';
import { TodoFilters as TodoFiltersType, TodoSort } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { getPriorityLabel, getStatusLabel } from '@/lib/utils';

interface TodoFiltersProps {
  filters: TodoFiltersType;
  sort: TodoSort;
  onFiltersChange: (filters: TodoFiltersType) => void;
  onSortChange: (sort: TodoSort) => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}) => {
  const { settings } = useTodoStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (field: keyof TodoFiltersType, value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters[field];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newFilters as any)[field] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleSortChange = (field: TodoSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field, direction: newDirection });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof TodoFiltersType]);

  const priorityOptions = [
    { value: '', label: '모든 우선순위' },
    { value: 'low', label: getPriorityLabel('low') },
    { value: 'medium', label: getPriorityLabel('medium') },
    { value: 'high', label: getPriorityLabel('high') },
    { value: 'urgent', label: getPriorityLabel('urgent') },
  ];

  const statusOptions = [
    { value: '', label: '모든 상태' },
    { value: 'todo', label: getStatusLabel('todo') },
    { value: 'in-progress', label: getStatusLabel('in-progress') },
    { value: 'completed', label: getStatusLabel('completed') },
  ];

  const assigneeOptions = [
    { value: '', label: '모든 담당자' },
    ...settings.teamMembers.map(member => ({
      value: member.name,
      label: `${member.name}${member.role ? ` (${member.role})` : ''}`,
    })),
  ];

  const categoryOptions = [
    { value: '', label: '모든 카테고리' },
    ...settings.categories.map(category => ({
      value: category.name,
      label: category.name,
    })),
  ];

  const sortOptions = [
    { value: 'createdAt', label: '생성일' },
    { value: 'updatedAt', label: '수정일' },
    { value: 'dueDate', label: '마감일' },
    { value: 'priority', label: '우선순위' },
    { value: 'title', label: '제목' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="제목이나 설명으로 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '필터 접기' : '필터 열기'}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            필터 초기화
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="담당자"
              value={filters.assignee || ''}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              options={assigneeOptions}
            />

            <Select
              label="카테고리"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={categoryOptions}
            />

            <Select
              label="상태"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />

            <Select
              label="우선순위"
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              options={priorityOptions}
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              정렬:
            </span>
            <div className="flex items-center space-x-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sort.field === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange(option.value as TodoSort['field'])}
                  className="flex items-center space-x-1"
                >
                  <span>{option.label}</span>
                  {sort.field === option.value && (
                    <svg
                      className={`w-3 h-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                활성 필터:
              </span>
              {filters.assignee && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  담당자: {filters.assignee}
                  <button
                    onClick={() => handleFilterChange('assignee', '')}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  카테고리: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  상태: {getStatusLabel(filters.status)}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 hover:text-yellow-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.priority && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  우선순위: {getPriorityLabel(filters.priority)}
                  <button
                    onClick={() => handleFilterChange('priority', '')}
                    className="ml-1 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  검색: &quot;{filters.search}&quot;
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
