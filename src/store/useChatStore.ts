import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RecommendedPlace } from './useRecommendationStore';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  itinerary: RecommendedPlace[] | null;
  courseName: string | null;
}

interface ChatState {
  messages: Message[];
  currentItinerary: RecommendedPlace[] | null;
  currentCourseName: string | null;
  isLoading: boolean;
  pastSessions: ChatSession[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setCurrentItinerary: (itinerary: RecommendedPlace[] | null) => void;
  setCurrentCourseName: (name: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

const initialMessages: Message[] = [
  {
    id: "init",
    role: "ai",
    content: "안녕하세요! TRIPLY AI 플레이리스터입니다❤️\n\n여러분의 여행을 하나의 특별한 트랙 리스트로 멋지게 기획해 드릴게요. 어떤 분위기의 여행을 꿈꾸고 계신가요? 🎶",
  },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: initialMessages,
      currentItinerary: null,
      currentCourseName: null,
      isLoading: false,
      pastSessions: [],
      setMessages: (updater) =>
        set((state) => ({
          messages: typeof updater === 'function' ? updater(state.messages) : updater,
        })),
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
      setCurrentCourseName: (name) => set({ currentCourseName: name }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      sendMessage: async (input: string) => {
        if (!input.trim() || get().isLoading) return;

        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: input,
        };
        
        get().setMessages((prev) => [...prev, userMsg]);
        set({ isLoading: true });

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_AI_URL}/ai/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_history: [
                { role: "user", content: input }
              ]
            }),
          });

          if (!response.ok) {
            throw new Error("서버 응답 에러");
          }
          const data = await response.json();

          // 응답 데이터가 아예 없거나 비어있는 경우 처리
          if (!data || (!data.reply && (!data.itinerary || data.itinerary.length === 0))) {
            const noDataMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: "죄송해요, 요청하신 조건에 맞는 장소를 찾지 못했어요. 😢\n다른 키워드나 분위기로 다시 한번 말씀해 주시겠어요?",
            };
            get().setMessages((prev) => [...prev, noDataMsg]);
            set({ isLoading: false });
            return;
          }

          if (data.reply || data.itinerary) {
            if (data.reply) {
              const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.reply,
              };
              get().setMessages((prev) => [...prev, aiMsg]);
            }

            if (data.itinerary && Array.isArray(data.itinerary) && data.itinerary.length > 0) {
              set({ currentItinerary: data.itinerary });
            }

            if (data.course_name) {
              set({ currentCourseName: data.course_name });
            }
          }
        } catch (error) {
          console.error("AI 연결 실패:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "죄송해요, AI 플레이리스터 서버와 잠시 연결이 끊겼어요. 잠시 후 다시 시도해 주세요! 🎶",
          };
          get().setMessages((prev) => [...prev, errorMsg]);
        } finally {
          set({ isLoading: false });
        }
      },
      clearChat: () => {
        const { messages, currentItinerary, currentCourseName, pastSessions } = get();
        if (messages.length > 1) {
          const firstUserMsg = messages.find(m => m.role === 'user')?.content || '새로운 대화';
          const title = currentCourseName || (firstUserMsg.length > 15 ? firstUserMsg.slice(0, 15) + '...' : firstUserMsg);
          
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title,
            date: new Date().toISOString(),
            messages: [...messages],
            itinerary: currentItinerary ? [...currentItinerary] : null,
            courseName: currentCourseName,
          };
          set({ 
            pastSessions: [newSession, ...pastSessions],
            messages: initialMessages, 
            currentItinerary: null, 
            currentCourseName: null,
            isLoading: false 
          });
        } else {
          set({ messages: initialMessages, currentItinerary: null, currentCourseName: null, isLoading: false });
        }
      },
      loadSession: (sessionId: string) => {
        const session = get().pastSessions.find(s => s.id === sessionId);
        if (session) {
          set({ 
            messages: session.messages, 
            currentItinerary: session.itinerary,
            currentCourseName: session.courseName || null,
            isLoading: false
          });
        }
      },
      deleteSession: (sessionId: string) => {
        set((state) => ({
          pastSessions: state.pastSessions.filter(s => s.id !== sessionId)
        }));
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
