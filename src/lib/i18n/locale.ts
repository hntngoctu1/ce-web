export function toBCP47Locale(locale: string): string {
  const l = (locale || 'vi').toLowerCase();
  if (l === 'vi') return 'vi-VN';
  if (l === 'en') return 'en-US';
  if (l === 'zh') return 'zh-CN';
  if (l === 'ko') return 'ko-KR';
  if (l === 'ja') return 'ja-JP';
  return 'en-US';
}
