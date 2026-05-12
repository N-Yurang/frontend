const http = require('http');

const PORT = 5001;

const FESTIVALS = [
  { festival_id: 1, name: "제주 들불축제", start_date: "2024-03-08", end_date: "2024-03-11", image_url: "/images/festival_1.jpg" },
  { festival_id: 2, name: "진해 군항제", start_date: "2024-03-25", end_date: "2024-04-03", image_url: "/images/festival_2.jpg" },
  { festival_id: 3, name: "에버랜드 장미축제", start_date: "2024-03-15", end_date: "2024-06-11", image_url: "/images/festival_3.jpg" },
  { festival_id: 4, name: "부산 불꽃축제", start_date: "2024-03-20", end_date: "", image_url: "/images/festival_4.jpg" },
  { festival_id: 5, name: "여의도 벚꽃축제", start_date: "2024-03-28", end_date: "2024-04-02", image_url: "/images/festival_5.jpg" }
];

const HIDDEN_PLACES = [
  { place_id: 201, name: "비밀의 숲 안돌오름", location: "제주 구좌읍", image_url: "/images/hidden_201.jpg" },
  { place_id: 202, name: "수로부인 헌화공원", location: "강원 삼척", image_url: "/images/hidden_202.jpg" },
  { place_id: 203, name: "다랭이마을 계단식 논", location: "경남 남해", image_url: "/images/hidden_203.jpg" },
  { place_id: 204, name: "벌교 갯벌", location: "전남 보성", image_url: "/images/hidden_204.jpg" }
];

const TRENDS = [
  {
    place_id: 101,
    media_source: "MOVIE TREND",
    name: "'왕의 남자' 촬영지!\n새롭게 뜨는 여행지 영월",
    image_url: "/images/trend_101.jpg"
  },
  {
    place_id: 102,
    media_source: "VARIETY SHOW",
    name: "힐링 예능 촬영지,\n숨은 낭만 고흥으로 떠나요",
    image_url: "/images/trend_102.jpg"
  }
];

const IMAGE_MAP = {
  '/images/festival_1.jpg': 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/festival_2.jpg': 'https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/festival_3.jpg': 'https://images.unsplash.com/photo-1554559388-755cc8bd75a9?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/festival_4.jpg': 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/festival_5.jpg': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/hidden_201.jpg': 'https://images.unsplash.com/photo-1521742617637-268e37130dfc?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/hidden_202.jpg': 'https://images.unsplash.com/photo-1588614486676-e1f9a2fbde64?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/hidden_203.jpg': 'https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/hidden_204.jpg': 'https://images.unsplash.com/photo-1612458428172-23c58cc440d4?auto=format&fit=crop&q=80&w=400&h=300',
  '/images/trend_101.jpg': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
  '/images/trend_102.jpg': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
};

const server = http.createServer((req, res) => {
  // 모든 요청 로깅 추가
  console.log(`[${new Date().toLocaleTimeString()}] 요청 수신: ${req.url}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url.startsWith('/images/')) {
    const targetUrl = IMAGE_MAP[req.url] || 'https://images.unsplash.com/photo-1521742617637-268e37130dfc?auto=format&fit=crop&q=80&w=400&h=300';
    res.writeHead(302, { Location: targetUrl });
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.url === '/api/recommend') {
    console.log(`[${new Date().toLocaleTimeString()}] 🤖 추천 요청 수신!`);
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      ai_reply: "부여의 정취를 느낄 수 있는 추천 코스입니다. 성흥산성 사랑나무에서 인생샷을 남기고, 중앙시장에서 맛있는 간식을 드신 후 궁남지에서 야경을 즐겨보세요! 🎶",
      itinerary: [
        { order: 1, name: "성흥산성 사랑나무", lat: 36.1950, lng: 126.9038, type: "TREND", desc: "인생샷 명소로 유명한 탁 트인 언덕", duration: "1h 30m" },
        { order: 2, name: "부여 중앙시장", lat: 36.2798, lng: 126.9140, type: "MARKET", desc: "점심 식사 및 현지 간식 탐방", duration: "1h 00m" },
        { order: 3, name: "궁남지 야경", lat: 36.2748, lng: 126.9142, type: "NIGHT", desc: "은은한 조명이 예쁜 산책로", duration: "45m" }
      ]
    }));
  } else if (req.url === '/api/auth/login' || req.url === '/api/auth/register') {
    console.log(`[${new Date().toLocaleTimeString()}] 🔐 로그인/가입 요청 수신!`);
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      message: '성공',
      data: { token: 'dummy-test-token' }
    }));
  } else if (req.url === '/api/festivals') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'success', data: { festivals: FESTIVALS } }));
  } else if (req.url === '/api/places/hidden') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'success', data: { places: HIDDEN_PLACES } }));
  } else if (req.url === '/api/places/trends') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'success', data: { places: TRENDS } }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
    console.log(`Dummy server running successfully on http://localhost:${PORT}`);
});
