import React, { useState, useEffect } from 'react';
import { NotificationSettings as NotificationSettingsType } from '@/types/todo';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showTestNotification,
} from '@/lib/notifications';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdate: (settings: NotificationSettingsType) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  // 클라이언트에서만 렌더링
  if (!isMounted) {
    return null;
  }

  const handleRequestPermission = async () => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      alert('알림 권한이 허용되었습니다! 이제 알림을 받을 수 있습니다.');
    } else {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 변경할 수 있습니다.');
    }
  };

  const handleToggleEnabled = () => {
    if (!settings.enabled && permission !== 'granted') {
      handleRequestPermission();
    }
    onUpdate({ ...settings, enabled: !settings.enabled });
  };

  const handleToggleNotifyBefore = (minutes: number) => {
    const newMinutes = settings.notifyBeforeMinutes.includes(minutes)
      ? settings.notifyBeforeMinutes.filter(m => m !== minutes)
      : [...settings.notifyBeforeMinutes, minutes].sort((a, b) => a - b);
    
    onUpdate({ ...settings, notifyBeforeMinutes: newMinutes });
  };

  const handleToggleDailySummary = () => {
    onUpdate({ ...settings, dailySummaryEnabled: !settings.dailySummaryEnabled });
  };

  const handleChangeDailySummaryTime = (time: string) => {
    onUpdate({ ...settings, dailySummaryTime: time });
  };

  const handleToggleSound = () => {
    onUpdate({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      alert('먼저 알림 권한을 허용해주세요.');
      return;
    }
    showTestNotification();
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ 현재 브라우저는 알림 기능을 지원하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 권한 상태 표시 */}
      {permission !== 'granted' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                🔔 알림 권한 필요
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                알림을 받으려면 브라우저 권한을 허용해주세요.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleRequestPermission}
              className="ml-4"
            >
              권한 요청
            </Button>
          </div>
        </div>
      )}

      {/* 알림 활성화 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            알림 활성화
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            마감일 알림과 요약 알림을 받습니다
          </p>
        </div>
        <button
          onClick={handleToggleEnabled}
          disabled={permission !== 'granted'}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enabled
              ? 'bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-700'
          } ${permission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* 마감 시간 전 알림 */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              마감 시간 전 알림
            </h3>
            <div className="space-y-2">
              {[
                { minutes: 30, label: '30분 전' },
                { minutes: 60, label: '1시간 전' },
                { minutes: 1440, label: '1일 전' },
              ].map(({ minutes, label }) => (
                <label
                  key={minutes}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={settings.notifyBeforeMinutes.includes(minutes)}
                    onChange={() => handleToggleNotifyBefore(minutes)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label} 알림
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 매일 요약 알림 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  출근 전 알림 (매일 아침)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  매일 출근 30분 전에 오늘 담당 업무를 알려줍니다 (기본: 9:30)
                </p>
              </div>
              <button
                onClick={handleToggleDailySummary}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.dailySummaryEnabled
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.dailySummaryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.dailySummaryEnabled && (
              <div className="ml-0">
                <Input
                  type="time"
                  label="알림 시간"
                  value={settings.dailySummaryTime}
                  onChange={(e) => handleChangeDailySummaryTime(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          {/* 기타 설정 */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              기타 설정
            </h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={handleToggleSound}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                알림 소리 재생
              </span>
            </label>
          </div>

          {/* 테스트 알림 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              알림 테스트
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleTestNotification}
                variant="primary"
                className="flex items-center justify-center space-x-2"
              >
                <span>🔔</span>
                <span>기본 알림</span>
              </Button>
              
              <Button
                onClick={() => {
                  if (permission !== 'granted') {
                    alert('먼저 알림 권한을 허용해주세요.');
                    return;
                  }
                  // 소리와 진동만 테스트
                  if ('vibrate' in navigator) {
                    navigator.vibrate([500, 200, 500]);
                  }
                  // Web Audio API로 소리 테스트
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 1000;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                  } catch (error) {
                    console.error('소리 테스트 실패:', error);
                  }
                  alert('소리와 진동을 테스트했습니다!');
                }}
                variant="secondary"
                className="flex items-center justify-center space-x-2"
              >
                <span>🔊</span>
                <span>소리+진동</span>
              </Button>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>테스트 팁:</strong> 브라우저 탭이 백그라운드에 있을 때 알림이 더 잘 보입니다.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 안내 메시지 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          ℹ️ <strong>알림 작동 조건:</strong> 브라우저 탭이 열려있어야 알림을 받을 수 있습니다.
          브라우저를 완전히 종료하면 알림이 작동하지 않습니다.
        </p>
      </div>
    </div>
  );
};
