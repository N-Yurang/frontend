export function getEulReul(word: string): string {
  if (!word) return "";
  const lastChar = word.charCodeAt(word.length - 1);
  
  // 한글 음절인지 확인 (가 ~ 힣)
  if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
    return "을(를)"; // 한글이 아닌 경우 기본값
  }
  
  // 종성(받침) 여부 확인
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
  return hasJongseong ? "을" : "를";
}

export function appendEulReul(word: string): string {
  if (!word) return "";
  return `${word}${getEulReul(word)}`;
}
