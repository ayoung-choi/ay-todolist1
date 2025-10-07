import React, { useState } from 'react';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatDate } from '@/lib/utils';

interface TodoCommentsProps {
  todo: Todo;
}

export const TodoComments: React.FC<TodoCommentsProps> = ({ todo }) => {
  const { addComment, updateComment, deleteComment, settings } = useTodoStore();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Get current user name (for now, use first team member or default)
      const currentUser = settings.teamMembers[0]?.name || '사용자';
      addComment(todo.id, newComment.trim(), currentUser);
      setNewComment('');
    }
  };

  const handleEditStart = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const handleEditSave = () => {
    if (editingCommentId && editingContent.trim()) {
      updateComment(todo.id, editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      deleteComment(todo.id, commentId);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">댓글 ({todo.comments.length})</h4>
      
      {/* Add Comment */}
      <div className="space-y-2">
        <Input
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddComment();
            }
          }}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            댓글 추가
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {todo.comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.author}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStart(comment.id, comment.content)}
                  className="h-6 w-6 p-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {editingCommentId === comment.id ? (
              <div className="space-y-2">
                <Input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave();
                    }
                  }}
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="secondary" onClick={handleEditCancel}>
                    취소
                  </Button>
                  <Button size="sm" onClick={handleEditSave}>
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        ))}
        
        {todo.comments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            아직 댓글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};
