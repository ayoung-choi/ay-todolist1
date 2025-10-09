import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeeklyDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

export const WeeklyDatePicker: React.FC<WeeklyDatePickerProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // 월요일 시작
  );

  // 현재 주의 날짜들 (월~일)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // 날짜 클릭
  const handleDateClick = (date: Date) => {
    // 같은 날짜를 다시 클릭하면 필터 해제
    if (selectedDate && isSameDay(date, selectedDate)) {
      onDateSelect(null);
    } else {
      onDateSelect(date);
    }
  };

  // 주 범위 표시
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const weekRangeText = `${format(weekStart, 'M월 d일', { locale: ko })} ~ ${format(weekEnd, 'M월 d일', { locale: ko })}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 {weekRangeText}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={goToPreviousWeek}
            variant="ghost"
            size="sm"
            className="px-2"
          >
            ◀ 이전주
          </Button>
          <Button
            onClick={goToToday}
            variant="secondary"
            size="sm"
          >
            오늘
          </Button>
          <Button
            onClick={goToNextWeek}
            variant="ghost"
            size="sm"
            className="px-2"
          >
            다음주 ▶
          </Button>
        </div>
      </div>

      {/* 요일 달력 */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const dayLabel = ['월', '화', '수', '목', '금', '토', '일'][index];
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }
                ${isTodayDate && !isSelected
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                  : ''
                }
              `}
            >
              <div className={`text-xs font-medium mb-1 ${
                isSelected 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {dayLabel}
              </div>
              <div className={`text-lg font-semibold ${
                isSelected 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isTodayDate
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {format(date, 'd')}
              </div>
              {isTodayDate && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  오늘
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 필터 상태 표시 */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-900 dark:text-blue-200">
              📌 <strong>{format(selectedDate, 'M월 d일 (E)', { locale: ko })}</strong>의 할 일만 표시중
            </span>
          </div>
          <Button
            onClick={() => onDateSelect(null)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            전체 보기
          </Button>
        </div>
      )}
    </div>
  );
};
