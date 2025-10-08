import { Todo } from '@/types/todo';
import { generateId } from './localStorage';

// 6가지 고정 업무 템플릿
export const workTemplates: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '1번 업무: 피부웨건 물품 채우기',
    description: `피부웨건 부족한 물품 채우기
• 해면볼, 붓, X로션용액, 스파츌라 (각 웨건당 1~2개씩만)
• 시트팩 (D7베드 밑) 5장 이상
• 각티슈, 팩거즈, 마취크림, 면봉, 마취랩
• 일회용해면, 손소독제`,
    assignee: '에스테1',
    priority: 'high',
    category: '오픈업무',
    status: 'todo',
    comments: [],
    attachments: [],
  },
  {
    title: '2번 업무: 보릭솜 & 초음파겔 채우기',
    description: `2-1. 피부웨건 보릭솜 채우기 (D&G존만)
• 매일 보릭솜 새로 교체하기
• 보릭솜 5~6장 소량만 채우기

2-2. 모든 웨건 초음파겔 새로 채우기
• 관리실 웨건: 초음파겔 1개
• 시술실(A, B, C, E, V, D5&D12) 웨건: 초음파겔 2개
• "먼저사용" 1개 + 일반 초음파겔 2개
• "먼저사용"은 다쓰면 세척해서 건조시키고 건조된 초음파겔 채워서 놓기`,
    assignee: '에스테2',
    priority: 'high',
    category: '오픈업무',
    status: 'todo',
    comments: [],
    attachments: [],
  },
  {
    title: '3번 업무: 스킨솜 & 일회용해면 채우기',
    description: `• 스킨솜 (관리실 & 시술실)
• 일회용해면 (시술실)`,
    assignee: '알바',
    priority: 'medium',
    category: '오픈업무',
    status: 'todo',
    comments: [],
    attachments: [],
  },
  {
    title: '4번 업무: D존&G존 정리 및 청소',
    description: `D존&G존 청소 및 정리
• 손거울, 쓰레기통: 알코올 스프레이 & 휴지로 닦기
• 피부웨건 + D5, D12, A1, A2 벽거울
• 팩물통, 모델링팩, 스파츌라 채우기
• D&G존 의자, 커텐 얼룩 알코올로 지우기`,
    assignee: '실장',
    priority: 'medium',
    category: '청소정리',
    status: 'todo',
    comments: [],
    attachments: [],
  },
  {
    title: '5번 업무: 시술실 & 피부 베드 정리',
    description: `시술실 & 피부 베드 세팅
• 긴수건, 터번 세팅 완료
• 베드 - 전기장판 & 공기청정기 ON
• 전기장판 A, D, G존 확인 필요
• 온다 핸드피스 알코올 소독 후, 거즈 2장씩 깔기`,
    assignee: '에스테1',
    priority: 'high',
    category: '시술준비',
    status: 'todo',
    comments: [],
    attachments: [],
  },
  {
    title: '6번 업무: 레이저 켜기 & 시설 점검',
    description: `레이저 및 시설 점검
• 레이저 가장 먼저 켜기 (피코플러스, 클라리티, 피코슈어프로, 엑셀브이)
• 컴퓨터 키고 닥터팔레트 로그인 해두기
• 시술실 부족한 물품 채우기 (붓, 온다붓, 온다유리볼, 스킨케어 제품류)
• 마감담당2: 긴수건&터번 걷기, 쓰레기통 마감
• 설겆이 담당`,
    assignee: '세예',
    priority: 'urgent',
    category: '오픈업무',
    status: 'todo',
    comments: [],
    attachments: [],
  },
];

// 템플릿을 실제 할 일로 변환하는 함수
export const createTodosFromTemplates = (): Todo[] => {
  const now = new Date();
  
  return workTemplates.map((template) => ({
    ...template,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));
};

// 특정 템플릿을 할 일로 변환
export const createTodoFromTemplate = (templateIndex: number): Todo => {
  if (templateIndex < 0 || templateIndex >= workTemplates.length) {
    throw new Error('유효하지 않은 템플릿 인덱스입니다.');
  }
  
  const template = workTemplates[templateIndex];
  const now = new Date();
  
  return {
    ...template,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
};
