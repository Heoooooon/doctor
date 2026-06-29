// @TASK Board - 관련 블로그 글 링크 카드
// 데이터가 없으면 아무것도 표시하지 않음

interface BlogLinkCardProps {
  boardCategory: string
}

export default function BlogLinkCard({ boardCategory }: BlogLinkCardProps) {
  // TODO: 실제 블로그 데이터 연동 시 여기서 fetch
  // 현재는 데이터가 없으므로 렌더링하지 않음
  return null
}
