import assert from 'node:assert/strict'
import test from 'node:test'
import { removeUnuploadedImageBlocks } from '../lib/column-ai.ts'

const ALLOWED = 'https://cdn.example.com/columns/real.png'

test('업로드된 이미지 블록은 그대로 남는다', () => {
  const html = `<div class="img-box"><img src="${ALLOWED}" alt="발치한 사랑니"></div><p class="img-caption">▲ 발치한 사랑니</p>`

  assert.equal(removeUnuploadedImageBlocks(html, [ALLOWED]), html)
})

test('src가 빈 자리표시자 블록은 캡션까지 제거된다', () => {
  const html = [
    '<p>본문 앞</p>',
    '<div class="img-box" contenteditable="false"><img src="" alt=""></div>',
    '<p class="img-caption"><br></p>',
    '<p>본문 뒤</p>',
  ].join('')

  const cleaned = removeUnuploadedImageBlocks(html, [ALLOWED])

  assert.equal(cleaned.includes('src=""'), false)
  assert.equal(cleaned.includes('img-box'), false)
  assert.match(cleaned, /<p>본문 앞<\/p>/)
  assert.match(cleaned, /<p>본문 뒤<\/p>/)
})

test('허용 목록에 없는 외부 이미지 블록도 제거된다', () => {
  const html = '<div class="img-box"><img src="https://other.example.com/x.png" alt="외부"></div>'

  assert.equal(removeUnuploadedImageBlocks(html, [ALLOWED]), '')
})
