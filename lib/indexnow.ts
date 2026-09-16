// IndexNow — 새 글이 올라가면 검색엔진에 바로 알린다.
// 키 파일은 public/<key>.txt에 있어야 하며, 값이 다르면 검색엔진이 403으로 거절한다.
const KEY = '1b88a06921ae4f9eb42c1b810a62a4ec'
const HOST = 'egundc.com'
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

// 운영 도메인에서만 의미가 있다. 로컬·미리보기에서는 호출하지 않는다.
function isEnabled(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * 공개된 글의 주소를 IndexNow에 통지한다.
 * 색인 통지는 부가 기능이라 실패해도 저장 결과에 영향을 주지 않는다.
 */
export async function notifyIndexNow(urls: readonly string[]): Promise<void> {
  if (!isEnabled() || urls.length === 0) return

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls,
      }),
    })
  } catch (error) {
    console.error('[indexnow] 통지 실패', error)
  }
}

export function columnUrl(id: string): string {
  return `https://${HOST}/column/${id}`
}
