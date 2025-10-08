import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';

// 요일별 업무 스케줄 타입
export interface WeeklySchedule {
  [dayOfWeek: string]: {
    [memberId: string]: number; // 멤버 ID -> 업무 번호 (1-6)
  };
}

interface WeeklyCalendarProps {
  teamMembers: Array<{ id: string; name: string; role?: string }>;
  schedule: WeeklySchedule;
  onScheduleChange: (schedule: WeeklySchedule) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: '월요일', short: '월' },
  { key: 'tuesday', label: '화요일', short: '화' },
  { key: 'wednesday', label: '수요일', short: '수' },
  { key: 'thursday', label: '목요일', short: '목' },
  { key: 'friday', label: '금요일', short: '금' },
  { key: 'saturday', label: '토요일', short: '토' },
  { key: 'sunday', label: '일요일', short: '일' },
];

const WORK_TASKS = [
  { value: '1', label: '1번: 피부웨건 물품 채우기' },
  { value: '2', label: '2번: 보릭솜 & 초음파겔 채우기' },
  { value: '3', label: '3번: 스킨솜 & 일회용해면 채우기' },
  { value: '4', label: '4번: D존&G존 정리 및 청소' },
  { value: '5', label: '5번: 시술실 & 피부 베드 정리' },
  { value: '6', label: '6번: 레이저 켜기 & 시설 점검' },
];

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  teamMembers,
  schedule,
  onScheduleChange,
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<number>(1);

  // 특정 요일의 멤버별 업무 할당
  const getMemberTask = (day: string, memberId: string): number => {
    return schedule[day]?.[memberId] || 0;
  };

  // 특정 요일의 업무 배정 현황
  const getDayStatus = (day: string): { assigned: number; total: number } => {
    const daySchedule = schedule[day] || {};
    const assigned = Object.values(daySchedule).filter(task => task > 0).length;
    return { assigned, total: teamMembers.length };
  };

  // 업무 할당
  const assignTask = () => {
    if (!selectedDay || !selectedMember) return;

    const newSchedule = { ...schedule };
    if (!newSchedule[selectedDay]) {
      newSchedule[selectedDay] = {};
    }
    
    newSchedule[selectedDay][selectedMember] = selectedTask;
    onScheduleChange(newSchedule);
    
    // 모달 닫기
    setSelectedDay(null);
    setSelectedMember('');
    setSelectedTask(1);
  };

  // 업무 해제
  const unassignTask = (day: string, memberId: string) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day]) {
      delete newSchedule[day][memberId];
    }
    onScheduleChange(newSchedule);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          📅 주간 업무 스케줄
        </h2>
        <Button
          onClick={() => {
            // 모든 스케줄 초기화
            if (confirm('모든 업무 할당을 초기화하시겠습니까?')) {
              onScheduleChange({});
            }
          }}
          variant="secondary"
          size="sm"
        >
          초기화
        </Button>
      </div>

      {/* 요일별 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const status = getDayStatus(day.key);
          const isCompleted = status.assigned === status.total;
          
          return (
            <div
              key={day.key}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                isCompleted
                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onClick={() => setSelectedDay(day.key)}
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {day.short}
                </h3>
                <div className={`text-sm mb-3 ${
                  isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {status.assigned}/{status.total} 배정
                </div>
                
                {/* 멤버별 업무 표시 */}
                <div className="space-y-1">
                  {teamMembers.map((member) => {
                    const taskNumber = getMemberTask(day.key, member.id);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {member.name}
                        </span>
                        {taskNumber > 0 ? (
                          <div className="flex items-center space-x-1">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">
                              {taskNumber}번
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                unassignTask(day.key, member.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">미배정</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 업무 할당 모달 */}
      <Modal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={`${selectedDay ? DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label : ''} 업무 할당`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              담당자 선택
            </label>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              options={teamMembers.map(member => ({
                value: member.id,
                label: `${member.name}${member.role ? ` (${member.role})` : ''}`
              }))}
              placeholder="담당자를 선택하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              업무 선택
            </label>
            <Select
              value={selectedTask.toString()}
              onChange={(e) => setSelectedTask(Number(e.target.value))}
              options={WORK_TASKS}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setSelectedDay(null)}
              variant="secondary"
            >
              취소
            </Button>
            <Button
              onClick={assignTask}
              disabled={!selectedMember}
            >
              할당하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          💡 사용법
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• 요일 카드를 클릭하여 업무 할당</li>
          <li>• 초록색: 모든 멤버 배정 완료</li>
          <li>• X 버튼으로 업무 해제 가능</li>
          <li>• 초기화 버튼으로 전체 스케줄 리셋</li>
        </ul>
      </div>
    </div>
  );
};
