"use client";

import { useState } from 'react';

export default function TripAIChat() {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        // 1. 내가 쓴 메시지 화면에 추가
        const currentInput = inputText;
        const newMessages = [...messages, { role: "user", text: currentInput }];
        setMessages(newMessages);
        setInputText("");
        setIsLoading(true);

        try {
            // 2. 파이썬 서버로 발송 (변수 이름 'user_message' 확인!)
            const response = await fetch("http://127.0.0.1:8000/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_message: currentInput }) // 👈 여기가 핵심!
            });

            const data = await response.json();

            // 3. AI 답변 추가
            if (data.status === "success") {
                setMessages(prev => [...prev, { role: "ai", text: data.ai_reply }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", text: "에러 발생: " + data.message }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "ai", text: "서버 연결에 실패했습니다." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center' }}>AI 챗봇 상담</h2>
            <div style={{ height: '500px', overflowY: 'auto', border: '1px solid #eee', padding: '20px', borderRadius: '20px', backgroundColor: '#f9f9f9', marginBottom: '20px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: '15px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '15px 20px',
                            borderRadius: '20px',
                            backgroundColor: msg.role === "user" ? "#f26b60" : "#ffffff", // 사용자: 빨강, AI: 흰색
                            color: msg.role === "user" ? "white" : "black",
                            maxWidth: '85%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div style={{ textAlign: 'left', color: '#888' }}>대답을 생각 중이에요...</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    style={{ flex: 1, padding: '15px', borderRadius: '30px', border: '1px solid #ddd' }}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                />
                <button onClick={sendMessage} style={{ padding: '0 25px', borderRadius: '30px', backgroundColor: '#eee', border: 'none', cursor: 'pointer' }}>전송</button>
            </div>
        </div>
    );
}