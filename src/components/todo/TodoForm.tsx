import React, { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import { getPriorityLabel, getStatusLabel } from '@/lib/utils';

interface TodoFormProps {
  todo?: Todo;
  onClose: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ todo, onClose }) => {
  const { addTodo, updateTodo, settings } = useTodoStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as Todo['priority'],
    category: '',
    dueDate: '',
    status: 'todo' as Todo['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        assignee: todo.assignee,
        priority: todo.priority,
        category: todo.category,
        dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '',
        status: todo.status,
      });
    } else {
      // Set default values
      setFormData(prev => ({
        ...prev,
        assignee: settings.defaultAssignee || settings.teamMembers[0]?.name || '',
        category: settings.categories[0]?.name || '',
      }));
    }
  }, [todo, settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목은 필수입니다.';
    }

    if (!formData.assignee) {
      newErrors.assignee = '담당자를 선택해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const todoData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignee: formData.assignee,
      priority: formData.priority,
      category: formData.category,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: formData.status,
    };

    if (todo) {
      updateTodo(todo.id, todoData);
    } else {
      addTodo(todoData);
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const priorityOptions = [
    { value: 'low', label: getPriorityLabel('low') },
    { value: 'medium', label: getPriorityLabel('medium') },
    { value: 'high', label: getPriorityLabel('high') },
    { value: 'urgent', label: getPriorityLabel('urgent') },
  ];

  const statusOptions = [
    { value: 'todo', label: getStatusLabel('todo') },
    { value: 'in-progress', label: getStatusLabel('in-progress') },
    { value: 'completed', label: getStatusLabel('completed') },
  ];

  const assigneeOptions = settings.teamMembers.map(member => ({
    value: member.name,
    label: `${member.name}${member.role ? ` (${member.role})` : ''}`,
  }));

  const categoryOptions = settings.categories.map(category => ({
    value: category.name,
    label: category.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="제목 *"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="할 일 제목을 입력하세요"
      />

      <Textarea
        label="설명"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="상세 설명을 입력하세요"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="담당자 *"
          value={formData.assignee}
          onChange={(e) => handleChange('assignee', e.target.value)}
          options={assigneeOptions}
          error={errors.assignee}
          placeholder="담당자를 선택하세요"
        />

        <Select
          label="카테고리 *"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
          error={errors.category}
          placeholder="카테고리를 선택하세요"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="우선순위"
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={priorityOptions}
        />

        <Select
          label="상태"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
        />

        <DatePicker
          label="마감일"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" variant="primary">
          {todo ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
};
