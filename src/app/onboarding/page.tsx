"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const TAGS = [
  "자연친화", "휴식", "가족여행", "혼자", "익스트림", "커플",
  "맛집탐방", "도심야경", "사진명소", "가성비", "럭셔리", "역사/문화"
];

const FREQUENCIES = [
  "1년에 1~2회", "계절마다 1회", "한 달에 1회", "주말마다 떠나요!"
];

export default function Onboarding() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isFormValid = name.trim() !== "" && age !== "" && gender !== "" && selectedTags.length > 0 && frequency !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      // Typically save user info to context, localStorage, or API
      router.push("/home");
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <motion.div 
        className="px-6 pt-16 pb-6 bg-white sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          반가워요!<br/>
          당신만의 여행 플레이리스트를 만들기 위해 몇가지 질문을 드릴게요.
        </h1>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <motion.form 
          initial="hidden" 
          animate="visible" 
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-8"
        >
          {/* Name */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block text-base font-bold text-gray-900">1. 이름</label>
            <input 
              type="text" 
              placeholder="이름을 입력해주세요" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
            />
          </motion.div>

          {/* Info (Age / Gender) */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block text-base font-bold text-gray-900">2. 내 정보 (나이, 성별)</label>
            <div className="flex gap-3">
              <input 
                type="number" 
                placeholder="나이 (예: 25)" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
              />
              <div className="w-1/2 flex bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button 
                  type="button"
                  onClick={() => setGender("M")}
                  className={`flex-1 rounded-lg text-sm font-medium transition-colors ${gender === "M" ? "bg-white text-brand-blue shadow-sm font-bold" : "text-gray-500"}`}
                >
                  남성
                </button>
                <button 
                  type="button"
                  onClick={() => setGender("F")}
                  className={`flex-1 rounded-lg text-sm font-medium transition-colors ${gender === "F" ? "bg-white text-brand-blue shadow-sm font-bold" : "text-gray-500"}`}
                >
                  여성
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block text-base font-bold text-gray-900">3. 나의 여행 취향</label>
            <p className="text-xs text-gray-500 mb-2">원하는 만큼 해시태그를 선택해주세요.</p>
            <div className="flex flex-wrap gap-2.5">
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                      isSelected
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Frequency */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block text-base font-bold text-gray-900">4. 여행의 빈도는 어떻게 되나요?</label>
            <div className="flex flex-col gap-2.5">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 border rounded-xl text-sm font-medium transition-all ${
                    frequency === freq 
                      ? "border-brand-blue bg-blue-50/50 text-brand-blue" 
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {freq}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${frequency === freq ? "border-brand-blue" : "border-gray-300"}`}>
                    {frequency === freq && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.form>
      </div>

      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 max-w-[480px] mx-auto z-20 pb-safe"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          className="w-full text-base h-14 rounded-2xl bg-brand-blue hover:bg-blue-600 transition-all shadow-lg"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          나만의 플리 만들기 시작!
        </Button>
      </motion.div>
    </div>
  );
}
