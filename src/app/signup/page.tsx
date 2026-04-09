"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.user_id || !formData.name || !formData.password) {
      setErrorMsg("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        user_id: formData.user_id,
        password: formData.password,
        name: formData.name
      };

      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        // Automatically login to get the token for onboarding
        try {
          const loginRes = await fetch("http://localhost:5001/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: payload.user_id, password: payload.password })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.status === "success") {
            localStorage.setItem("triply_token", loginData.data.token);
            setSuccessMsg("회원가입이 완료되었습니다! 내 취향을 알려주세요.");
            setTimeout(() => router.push("/onboarding"), 1500);
            return;
          }
        } catch (e) {
          console.error("Auto login failed", e);
        }
        
        // Fallback
        setSuccessMsg("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setErrorMsg(data.message || "회원가입에 실패했습니다.");
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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            새로운 여행의 시작,<br /> <span className="text-brand-red">Triply</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
            아이디와 비밀번호, 닉네임을 입력하고 가입을 완료하세요.
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

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="닉네임 (예: 김여행)"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-[15px] focus:border-brand-red focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-brand-red font-medium transition-all outline-none dark:text-white placeholder:text-gray-400"
              />
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-brand-red text-sm font-bold ml-2 mt-1"
                >
                  {errorMsg}
                </motion.p>
              )}
              {successMsg && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-brand-green text-sm font-bold ml-2 mt-1"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-brand-red hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-red/30 transition-all flex justify-center items-center h-[56px] disabled:opacity-70 disabled:cursor-not-allowed text-[16px]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : "가입하기"}
            </button>
            
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-gray-500 font-medium">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-brand-red font-bold hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
