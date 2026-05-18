import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RecommendedPlace } from './useRecommendationStore';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatState {
  messages: Message[];
  currentItinerary: RecommendedPlace[] | null;
  isLoading: boolean;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setCurrentItinerary: (itinerary: RecommendedPlace[] | null) => void;
  setIsLoading: (loading: boolean) => void;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
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
      isLoading: false,
      setMessages: (updater) =>
        set((state) => ({
          messages: typeof updater === 'function' ? updater(state.messages) : updater,
        })),
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
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
      clearChat: () => set({ messages: initialMessages, currentItinerary: null, isLoading: false }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
