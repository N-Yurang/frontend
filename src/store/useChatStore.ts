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
  recommendedItineraryId: string | null;
  totalDistance: number | null;
}

interface ChatState {
  messages: Message[];
  currentItinerary: RecommendedPlace[] | null;
  currentCourseName: string | null;
  recommendedItineraryId: string | null;
  savedCourseId: string | null;
  totalDistance: number | null;
  isLoading: boolean;
  pastSessions: ChatSession[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setCurrentItinerary: (itinerary: RecommendedPlace[] | null) => void;
  setCurrentCourseName: (name: string | null) => void;
  setRecommendedItineraryId: (id: string | null) => void;
  setSavedCourseId: (id: string | null) => void;
  setTotalDistance: (distance: number | null) => void;
  setIsLoading: (loading: boolean) => void;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
  resetForNewUser: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  isBookmarked: boolean;
  setIsBookmarked: (bookmarked: boolean) => void;
}

const initialMessages: Message[] = [
  {
    id: "init",
    role: "ai",
    content: "안녕하세요! TRIPLY AI 플레이리스터입니다❤️\n\n여러분의 여행을 하나의 특별한 트랙 리스트로 멋지게 기획해 드릴게요. 어떤 분위기의 여행을 꿈꾸고 계신가요? 🎶",
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_URL;

async function requestRecommendation(input: string, token: string | null, travelDate: string) {
  const candidates = [
    API_BASE_URL ? `${API_BASE_URL}/api/v1/recommend` : null,
    AI_BASE_URL ? `${AI_BASE_URL}/ai/recommend` : null,
    API_BASE_URL ? `${API_BASE_URL}/api/recommend` : null,
  ].filter((url): url is string => Boolean(url));

  let lastError: Error | null = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          chat_history: [
            { role: "user", content: input }
          ],
          travel_date: travelDate
        }),
      });

      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`Endpoint not found: ${url}`);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI 요청에 실패했습니다.");
    }
  }

  throw lastError || new Error("AI 서버 주소가 설정되지 않았습니다.");
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: initialMessages,
      currentItinerary: null,
      currentCourseName: null,
      recommendedItineraryId: null,
      savedCourseId: null,
      totalDistance: null,
      isLoading: false,
      isBookmarked: false,
      pastSessions: [],
      setMessages: (updater) =>
        set((state) => ({
          messages: typeof updater === 'function' ? updater(state.messages) : updater,
        })),
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
      setCurrentCourseName: (name) => set({ currentCourseName: name }),
      setRecommendedItineraryId: (id) => set({ recommendedItineraryId: id }),
      setSavedCourseId: (id) => set({ savedCourseId: id }),
      setTotalDistance: (distance) => set({ totalDistance: distance }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsBookmarked: (bookmarked) => set({ isBookmarked: bookmarked }),
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
          const token = localStorage.getItem("triply_token");
          // 백엔드가 필수로 요구하는 travel_date 추가 (일단 오늘 날짜)
          const today = new Date();
          const travelDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const response = await requestRecommendation(input, token, travelDate);

          if (response.status === 401 || response.status === 403) {
            throw new Error("로그인이 필요합니다.");
          }

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "서버 응답 에러");
          }
          const responseData = await response.json();
          console.log("AI 응답 데이터:", responseData);
          
          // 백엔드는 결과를 { data: { ... } } 형태로 감싸서 보내므로 내부 데이터를 추출
          const payload = responseData.data || responseData;
          const reply = payload.reply || payload.ai_reply;

          // 응답 데이터가 아예 없거나 비어있는 경우 처리
          if (!payload || (!reply && (!payload.itinerary || payload.itinerary.length === 0))) {
            const noDataMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: "죄송해요, 요청하신 조건에 맞는 장소를 찾지 못했어요. 😢\n다른 키워드나 분위기로 다시 한번 말씀해 주시겠어요?",
            };
            get().setMessages((prev) => [...prev, noDataMsg]);
            set({ isLoading: false });
            return;
          }

          // 새로운 추천 결과가 들어오면 이전 저장/추천 ID가 섞이지 않도록 초기화
          set({ isBookmarked: false, savedCourseId: null, recommendedItineraryId: null });

          if (reply || payload.itinerary) {
            if (reply) {
              const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: reply,
              };
              get().setMessages((prev) => [...prev, aiMsg]);
            }

            if (payload.itinerary && Array.isArray(payload.itinerary) && payload.itinerary.length > 0) {
              set({ currentItinerary: payload.itinerary });
            }

            let extractedName = payload.course_name;
            if (!extractedName && reply) {
              const match = reply.match(/맞게 '([^']+)' 기획을/);
              if (match && match[1]) {
                extractedName = match[1];
              }
            }

            if (extractedName) {
              set({ currentCourseName: extractedName });
            }

            const itineraryId =
              payload.recommended_itinerary_id ??
              payload.recommendedItineraryId ??
              payload.itinerary_id ??
              payload.itineraryId ??
              payload.id;

            if (itineraryId) {
              set({ recommendedItineraryId: itineraryId.toString() });
            }

            if (payload.total_distance !== undefined) {
              set({ totalDistance: payload.total_distance });
            }
          }
        } catch (error: unknown) {
          console.error("AI 연결 실패:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: (error as Error)?.message === "로그인이 필요합니다."
              ? "코스 저장을 위해서는 로그인이 필요해요! 로그인 후 다시 시도해 주시겠어요?"
              : "죄송해요, AI 플레이리스터 서버와 잠시 연결이 끊겼어요. 잠시 후 다시 시도해 주세요! 🎶",
          };
          get().setMessages((prev) => [...prev, errorMsg]);
        } finally {
          set({ isLoading: false });
        }
      },
      clearChat: () => {
        const { messages, currentItinerary, currentCourseName, recommendedItineraryId, totalDistance, pastSessions } = get();
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
            recommendedItineraryId,
            totalDistance,
          };
          set({
            pastSessions: [newSession, ...pastSessions],
            messages: initialMessages,
            currentItinerary: null,
            currentCourseName: null,
            recommendedItineraryId: null,
            savedCourseId: null,
            totalDistance: null,
            isLoading: false,
            isBookmarked: false
          });
        } else {
          set({ 
            messages: initialMessages, 
            currentItinerary: null, 
            currentCourseName: null, 
            recommendedItineraryId: null, 
            savedCourseId: null,
            totalDistance: null,
            isLoading: false,
            isBookmarked: false
          });
        }
      },
      resetForNewUser: () => {
        set({
          messages: initialMessages,
          currentItinerary: null,
          currentCourseName: null,
          recommendedItineraryId: null,
          savedCourseId: null,
          totalDistance: null,
          isLoading: false,
          isBookmarked: false,
          pastSessions: [],
        });
      },
      loadSession: (sessionId: string) => {
        const session = get().pastSessions.find(s => s.id === sessionId);
        if (session) {
          set({
            messages: session.messages,
            currentItinerary: session.itinerary,
            currentCourseName: session.courseName || null,
            recommendedItineraryId: session.recommendedItineraryId || null,
            savedCourseId: null,
            totalDistance: session.totalDistance || null,
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
