import { User, Edit2 } from "lucide-react";

export default function MyPage() {
  const TAGS = ["미디어트렌드", "숨은명소", "로컬맛집", "대중교통"];

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbfb] pb-20">
      <div className="pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-gray-50">
        <h1 className="text-[17px] font-bold text-center text-gray-900">내 정보</h1>
      </div>

      <div className="px-5 mt-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#f0f4f8] rounded-full flex items-center justify-center text-gray-400">
              <User size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1">여행자 님</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">ID: 202210127</p>
            </div>
          </div>
          <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-gray-200">
            수정
          </button>
        </div>

        {/* Travel Preferences */}
        <div className="mb-10">
          <h3 className="flex items-center text-base font-bold text-gray-900 mb-4 gap-1.5">
            <span>✨</span> 나의 여행 취향
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {TAGS.map((tag) => (
              <span key={tag} className="border border-brand-red text-brand-red text-sm px-3.5 py-1.5 rounded-full font-medium shadow-sm">
                #{tag}
              </span>
            ))}
            <button className="border border-dashed border-gray-300 text-gray-500 text-sm px-3.5 py-1.5 rounded-full font-medium transition-colors hover:bg-gray-50 flex items-center gap-1">
              + 추가
            </button>
          </div>
        </div>

        {/* Travel Records */}
        <div>
          <h3 className="flex items-center text-base font-bold text-gray-900 mb-4 gap-1.5">
            <span>📁</span> 나의 여행 기록
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-3xl">❤️</span>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900 mb-1">찜한 여행지</span>
                <span className="block text-[11px] text-gray-500 font-medium">12개 장소</span>
              </div>
            </div>
            <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-3xl">🗓️</span>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900 mb-1">저장된 코스</span>
                <span className="block text-[11px] text-gray-500 font-medium">3개 일정</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pt-12">
        <a href="/" className="block text-center w-full py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-2xl">
          로그아웃
        </a>
      </div>
    </div>
  );
}
