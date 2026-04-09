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
  "거의 안 가요", "1년에 1~2회", "계절마다 1회", "한 달에 1회", "주말마다 떠나요!"
];

export default function Onboarding() {
  const router = useRouter();

  // Form State
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

  const isFormValid = age !== "" && gender !== "" && selectedTags.length > 0 && frequency !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const token = localStorage.getItem("triply_token");
      const mappedGender = gender === "M" ? "남성" : "여성";

      // Since the UI doesn't bucket tags into mood/companion/feature yet,
      // we'll send it inside a general "flat" key to satisfy the JSON requirement.
      const payload = {
        gender: mappedGender,
        travel_frequency: frequency,
        travel_tags: {
          flat_tags: selectedTags
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        router.push("/home");
      } else {
        alert(data.message || "온보딩 데이터 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("온보딩 서버 연동 중 오류가 발생했습니다.");
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <motion.div
        className="px-6 pt-10 pb-4 bg-white/80 dark:bg-gray-950/80 sticky top-0 z-10 border-b border-gray-100/50 dark:border-gray-800 backdrop-blur-md transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold text-[#f43f5e] mb-3">
            반가워요!
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            당신만의 여행 플레이리스트를<br />
            만들기 위해 몇 가지 질문을 드릴게요.
          </p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <motion.form
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-8"
        >
          {/* Info (Age / Gender) */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block text-base font-bold text-gray-900 dark:text-gray-100">내정보</label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="나이"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-1/2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all dark:text-white"
              />
              <div className="w-1/2 flex bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setGender("M")}
                  className={`flex-1 rounded-lg text-sm font-medium transition-colors ${gender === "M" ? "bg-white dark:bg-gray-800 text-brand-red dark:text-red-400 shadow-sm font-bold" : "text-gray-500 dark:text-gray-400"}`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender("F")}
                  className={`flex-1 rounded-lg text-sm font-medium transition-colors ${gender === "F" ? "bg-white dark:bg-gray-800 text-brand-red dark:text-red-400 shadow-sm font-bold" : "text-gray-500 dark:text-gray-400"}`}
                >
                  여성
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div>
              <label className="block text-base font-bold text-gray-900 dark:text-gray-100">나의 여행 취향</label>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1 font-medium">원하는 만큼 해시태그를 선택해주세요.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${isSelected
                      ? "bg-brand-red text-white border-brand-red dark:border-red-500"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
            <label className="block text-base font-bold text-gray-900 dark:text-gray-100">평소 여행 빈도는 어떻게 되나요?</label>
            <div className="flex flex-col gap-2.5">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 border rounded-xl text-sm font-medium transition-all ${frequency === freq
                    ? "border-brand-red bg-red-50/50 dark:bg-red-900/20 text-brand-red dark:text-red-400"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  {freq}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${frequency === freq ? "border-brand-red dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}>
                    {frequency === freq && <div className="w-2.5 h-2.5 bg-brand-red dark:bg-red-400 rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.form>
      </div>

      <motion.div
        className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 max-w-[480px] mx-auto z-20 pb-safe transition-colors"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          className="w-full text-base h-14 rounded-2xl bg-brand-red hover:bg-red-600 transition-all shadow-lg text-white"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          나만의 플리 만들기 시작!
        </Button>
      </motion.div>
    </div>
  );
}
