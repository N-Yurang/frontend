"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Map, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  // Hide BottomNav on splash, onboarding, login, and signup
  if (
    pathname === '/' || 
    pathname === '/onboarding' || 
    pathname === '/login' || 
    pathname === '/signup' ||
    pathname.startsWith('/place')
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] mx-auto bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/home" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/home' ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">홈</span>
        </Link>
        <Link href="/chat" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/chat' ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
          <MessageCircle size={24} />
          <span className="text-[10px] mt-1 font-medium">AI 챗봇</span>
        </Link>
        <Link href="/map" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/map' ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
          <Map size={24} />
          <span className="text-[10px] mt-1 font-medium">코스&지도</span>
        </Link>
        <Link href="/mypage" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/mypage' ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">마이페이지</span>
        </Link>
      </div>
    </nav>
  );
}
