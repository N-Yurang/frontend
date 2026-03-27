"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-red to-brand-orange">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-xl mb-6 text-brand-red">
          <PlayCircle size={48} strokeWidth={1.5} />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white text-4xl font-extrabold tracking-tight mb-3"
        >
          TRIPLY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-red-50 text-base font-medium tracking-wide"
        >
          너만의 Trip playlist를 만들어봐
        </motion.p>
      </motion.div>
    </div>
  );
}
