/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { target: 1, duration: '30s' },
    { target: 10, duration: '30s' },
    { target: 100, duration: '30s' },
    { target: 1000, duration: '30s' },
  ],
};
export default function getAnswersTest() {
  const payload = JSON.stringify({
    body: 'This is a question',
    name: 'great_username',
    email: 'user@email.com',
    product_id: 1,
  });
  http.post('http://localhost:6246/qa/questions/3343014/answers', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  sleep(1);
}
