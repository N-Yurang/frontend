export default function CourseMap() {
  const ITINERARY = [
    { 
      id: 1, 
      name: "성흥산성 사랑나무", 
      desc: "인생샷 명소로 유명한 탁 트인 언덕",
    },
    { 
      id: 2, 
      name: "부여 중앙시장", 
      desc: "점심 식사 및 현지 간식 탐방 (이동: 차로 15분)",
    },
    { 
      id: 3, 
      name: "궁남지 야경", 
      desc: "은은한 조명이 예쁜 산책로 마무~리",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-gray-50">
        <h1 className="text-[17px] font-bold text-center text-gray-900">추천 코스 및 지도</h1>
      </div>

      {/* Map Area Placeholder */}
      <div className="h-[45vh] bg-[#e5e5e5] relative flex flex-col items-center justify-center">
        <p className="text-gray-600 font-bold text-[15px] flex items-center gap-1.5">
          <span className="text-xl">🗺️</span> 카카오맵/구글맵 API 연동 영역
        </p>
      </div>

      {/* Itinerary Timeline */}
      <div className="flex-1 bg-white px-5 pt-6 pb-8">
        <h2 className="flex items-center text-[17px] font-bold text-gray-900 mb-6 gap-2">
          <span className="text-xl">📍</span> AI 추천 당일치기 동선
        </h2>

        <div className="relative pl-2">
          {/* Vertical Line connecting the dots */}
          <div className="absolute left-[30px] top-6 bottom-6 w-[1px] bg-gray-200"></div>

          <div className="space-y-6">
            {ITINERARY.map((item, index) => (
              <div key={item.id} className="relative flex items-start gap-4 z-10">
                <div className="w-12 h-12 bg-brand-red text-white flex items-center justify-center rounded-full font-bold text-lg shadow-sm flex-shrink-0">
                  {item.id}
                </div>
                
                <div className="flex flex-col items-start justify-center pt-1 w-full border-b border-gray-100 pb-5">
                  <h3 className="font-bold text-gray-900 text-[16px] mb-1">{item.name}</h3>
                  <p className="text-[13px] text-gray-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
