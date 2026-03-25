/** HTML 태그 제거 후 한국어 기준 읽기 시간(분) 반환 */
export function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const chars = text.length;
  // 한국어 평균 읽기 속도: 분당 약 500자
  const minutes = Math.ceil(chars / 500);
  return Math.max(1, minutes);
}
