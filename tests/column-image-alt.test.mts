import assert from 'node:assert/strict'
import test from 'node:test'
import { fillMissingImageAlt } from '../lib/column-ai.ts'

const TITLE = '누워 있는 사랑니, 꼭 빼야 하나요?'

test('빈 alt는 바로 아래 캡션 문구로 채워진다', () => {
  const html = [
    '<div class="img-box"><img src="https://cdn.example.com/a.png" alt=""></div>',
    '<p class="img-caption">▲ 파노라마 엑스레이에서 확인한 매복 사랑니</p>',
  ].join('\n')

  const filled = fillMissingImageAlt(html, TITLE)

  assert.match(filled, /alt="파노라마 엑스레이에서 확인한 매복 사랑니"/)
  assert.equal(filled.includes('alt=""'), false)
})

test('alt 속성이 아예 없는 이미지에도 설명이 붙는다', () => {
  const html = [
    '<div class="img-box"><img src="https://cdn.example.com/b.png"></div>',
    '<p class="img-caption">▲ 발치 직후 봉합한 잇몸</p>',
  ].join('\n')

  const filled = fillMissingImageAlt(html, TITLE)

  assert.match(filled, /<img alt="발치 직후 봉합한 잇몸" src="https:\/\/cdn\.example\.com\/b\.png">/)
})

test('캡션이 없으면 글 제목으로 대체한다', () => {
  const html = '<div class="img-box"><img src="https://cdn.example.com/c.png" alt=""></div>'

  const filled = fillMissingImageAlt(html, TITLE)

  assert.match(filled, /alt="누워 있는 사랑니, 꼭 빼야 하나요\?"/)
})

test('이미 설명이 있는 alt는 건드리지 않는다', () => {
  const html = [
    '<div class="img-box"><img src="https://cdn.example.com/d.png" alt="치아 단면 모형"></div>',
    '<p class="img-caption">▲ 다른 설명</p>',
  ].join('\n')

  assert.equal(fillMissingImageAlt(html, TITLE), html)
})

test('큰따옴표가 든 캡션도 속성을 깨뜨리지 않는다', () => {
  const html = [
    '<div class="img-box"><img src="https://cdn.example.com/e.png" alt=""></div>',
    '<p class="img-caption">▲ 환자분이 "시리다"고 말한 부위</p>',
  ].join('\n')

  const filled = fillMissingImageAlt(html, TITLE)

  assert.match(filled, /alt="환자분이 &quot;시리다&quot;고 말한 부위"/)
  assert.equal(filled.split('"').length % 2, 1)
})
