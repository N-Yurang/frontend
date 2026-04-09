"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    user_id: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.user_id || !formData.password) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const resData = await res.json();
      
      if (res.ok && resData.status === "success") {
        const { token } = resData.data;
        
        // Save token to localStorage for subsequent API requests
        localStorage.setItem("triply_token", token);
        
        // Force route to home on login as requested
        router.push("/home");
      } else {
        setErrorMsg(resData.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <header className="px-5 pt-6 pb-4 sticky top-0 z-10 bg-white dark:bg-gray-950">
        <button onClick={() => router.back()} className="text-gray-900 dark:text-white hover:text-brand-red transition-colors">
          <ChevronLeft size={28} />
        </button>
      </header>

      <main className="flex-1 px-6 pb-20 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-10">
            <h1 className="text-4xl font-extrabold text-brand-red tracking-[0.2em] ml-2">
              TRIPLY
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            다시 만나서 반가워요!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
            로그인하고 나만의 맞춤 여행 플레이리스트를 확인하세요.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="아이디"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-[15px] focus:border-brand-red focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-brand-red font-medium transition-all outline-none dark:text-white placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-[15px] focus:border-brand-red focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-brand-red font-medium transition-all outline-none dark:text-white placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center justify-center text-gray-400 hover:text-brand-red transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm font-medium text-gray-500 hover:text-brand-red transition-colors">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-brand-red text-sm font-bold ml-2"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-brand-red hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-red/30 transition-all flex justify-center items-center h-[56px] disabled:opacity-70 disabled:cursor-not-allowed text-[16px]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : "로그인"}
            </button>
            
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-gray-500 font-medium">
              아직 계정이 없으신가요?{" "}
              <Link href="/signup" className="text-brand-red font-bold hover:underline">
                가입하기
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
