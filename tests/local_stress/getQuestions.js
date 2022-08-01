/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { target: 1, duration: '30s' },
    { target: 10, duration: '30s' },
    { target: 100, duration: '30s' },
    { target: 1000, duration: '30s' },
  ],
};

export default function getQuestionsTest() {
  const res = http.get('http://localhost:6246/qa/questions?product_id=1000011&count=5');
  sleep(1);
  check(res, {
    'status code is 200': (r) => r.status === 200,
    'contains correct data': (r) => {
      const { product_id, results } = JSON.parse(r.body);
      const tests = [
        product_id === '1000011',
        Array.isArray(results),
        results.length !== 0,
      ];
      return tests.every((test) => !!test);
    },
  });
}
