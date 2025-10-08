import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';

export const PWAInstall: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // PWA 설치 지원 확인
    const checkPWAInstallSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(isSupported);
      
      // 이미 설치되었는지 확인
      if (window.matchMedia('(display-mode: standalone)').matches || 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkPWAInstallSupport();

    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('앱 설치가 지원되지 않습니다. Safari에서는 "공유" → "홈 화면에 추가"를 사용하세요.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA 설치됨');
        setIsInstalled(true);
      } else {
        console.log('PWA 설치 거부됨');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA 설치 실패:', error);
      alert('앱 설치에 실패했습니다.');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ℹ️ 현재 브라우저는 PWA 설치를 지원하지 않습니다.
        </p>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
          ✅ 앱이 설치되었습니다!
        </h4>
        <p className="text-sm text-green-800 dark:text-green-300">
          이제 핸드폰에서도 알림을 받을 수 있습니다. 앱을 열어서 사용하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
        📱 핸드폰에서도 알림 받기
      </h4>
      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
        앱으로 설치하면 핸드폰에서도 알림을 받을 수 있습니다.
      </p>
      
      <div className="space-y-2">
        <Button
          onClick={handleInstallClick}
          className="w-full"
          disabled={!deferredPrompt}
        >
          {deferredPrompt ? '📱 앱 설치하기' : '설치 준비중...'}
        </Button>
        
        <div className="text-xs text-blue-700 dark:text-blue-400">
          <p><strong>Safari 사용자:</strong></p>
          <p>공유 버튼 → &quot;홈 화면에 추가&quot;</p>
          <p><strong>Chrome 사용자:</strong></p>
          <p>주소창 오른쪽 &quot;설치&quot; 버튼</p>
        </div>
      </div>
    </div>
  );
};
