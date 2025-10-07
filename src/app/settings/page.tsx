'use client';

import React, { useState, useEffect } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Header } from '@/components/layout/Header';
import { TeamMember, Category } from '@/types/todo';
import { dataMigration } from '@/lib/localStorage';
import { generateId } from '@/lib/localStorage';

export default function SettingsPage() {
  const { settings, updateTeamMembers, updateCategories } = useTodoStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    setTeamMembers(settings.teamMembers);
    setCategories(settings.categories);
  }, [settings]);

  const handleAddMember = () => {
    if (newMember.name.trim()) {
      const member: TeamMember = {
        id: generateId(),
        name: newMember.name.trim(),
        role: newMember.role.trim() || undefined,
      };
      const updatedMembers = [...teamMembers, member];
      setTeamMembers(updatedMembers);
      updateTeamMembers(updatedMembers);
      setNewMember({ name: '', role: '' });
      setIsAddMemberModalOpen(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({ name: member.name, role: member.role || '' });
    setIsAddMemberModalOpen(true);
  };

  const handleUpdateMember = () => {
    if (editingMember && newMember.name.trim()) {
      const updatedMembers = teamMembers.map(member =>
        member.id === editingMember.id
          ? { ...member, name: newMember.name.trim(), role: newMember.role.trim() || undefined }
          : member
      );
      setTeamMembers(updatedMembers);
      updateTeamMembers(updatedMembers);
      setEditingMember(null);
      setNewMember({ name: '', role: '' });
      setIsAddMemberModalOpen(false);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('정말로 이 팀원을 삭제하시겠습니까?')) {
      const updatedMembers = teamMembers.filter(member => member.id !== memberId);
      setTeamMembers(updatedMembers);
      updateTeamMembers(updatedMembers);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: generateId(),
        name: newCategory.name.trim(),
        color: newCategory.color,
      };
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
      setNewCategory({ name: '', color: '#3B82F6' });
      setIsAddCategoryModalOpen(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, color: category.color });
    setIsAddCategoryModalOpen(true);
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategory.name.trim()) {
      const updatedCategories = categories.map(category =>
        category.id === editingCategory.id
          ? { ...category, name: newCategory.name.trim(), color: newCategory.color }
          : category
      );
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
      setEditingCategory(null);
      setNewCategory({ name: '', color: '#3B82F6' });
      setIsAddCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
    }
  };

  const handleExportData = () => {
    const data = dataMigration.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skin-team-todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (dataMigration.importAll(data)) {
        alert('데이터를 성공적으로 가져왔습니다.');
        window.location.reload();
      } else {
        alert('데이터 가져오기에 실패했습니다. 파일 형식을 확인해주세요.');
      }
    };
    reader.readAsText(file);
  };

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            설정
          </h1>
        </div>

      {/* Team Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            팀원 관리
          </h2>
          <Button
            onClick={() => {
              setEditingMember(null);
              setNewMember({ name: '', role: '' });
              setIsAddMemberModalOpen(true);
            }}
          >
            팀원 추가
          </Button>
        </div>
        
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </span>
                {member.role && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({member.role})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
          
          {teamMembers.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              등록된 팀원이 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            카테고리 관리
          </h2>
          <Button
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', color: '#3B82F6' });
              setIsAddCategoryModalOpen(true);
            }}
          >
            카테고리 추가
          </Button>
        </div>
        
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              등록된 카테고리가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          데이터 관리
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              데이터 내보내기
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              현재 모든 데이터를 JSON 파일로 내보냅니다.
            </p>
            <Button onClick={handleExportData} variant="secondary">
              데이터 내보내기
            </Button>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              데이터 가져오기
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              JSON 파일에서 데이터를 가져옵니다. 기존 데이터는 덮어씌워집니다.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <Button
              onClick={() => document.getElementById('import-file')?.click()}
              variant="secondary"
            >
              데이터 가져오기
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setEditingMember(null);
          setNewMember({ name: '', role: '' });
        }}
        title={editingMember ? '팀원 수정' : '팀원 추가'}
      >
        <div className="space-y-4">
          <Input
            label="이름 *"
            value={newMember.name}
            onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
            placeholder="팀원 이름을 입력하세요"
          />
          <Input
            label="역할"
            value={newMember.role}
            onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
            placeholder="역할을 입력하세요 (선택사항)"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setEditingMember(null);
                setNewMember({ name: '', role: '' });
              }}
            >
              취소
            </Button>
            <Button
              onClick={editingMember ? handleUpdateMember : handleAddMember}
              disabled={!newMember.name.trim()}
            >
              {editingMember ? '수정' : '추가'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => {
          setIsAddCategoryModalOpen(false);
          setEditingCategory(null);
          setNewCategory({ name: '', color: '#3B82F6' });
        }}
        title={editingCategory ? '카테고리 수정' : '카테고리 추가'}
      >
        <div className="space-y-4">
          <Input
            label="이름 *"
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="카테고리 이름을 입력하세요"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              색상
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newCategory.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddCategoryModalOpen(false);
                setEditingCategory(null);
                setNewCategory({ name: '', color: '#3B82F6' });
              }}
            >
              취소
            </Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              disabled={!newCategory.name.trim()}
            >
              {editingCategory ? '수정' : '추가'}
            </Button>
          </div>
        </div>
      </Modal>
      </main>
    </div>
  );
}
