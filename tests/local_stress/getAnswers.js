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

export default function getAnswersTest() {
  const res = http.get('http://localhost:6246/qa/questions/3343014/answers');
  sleep(1);
  check(res, {
    'status code is 200': (r) => r.status === 200,
    'contains correct data': (r) => {
      const { question, results } = JSON.parse(r.body);
      const tests = [
        question === '3343014',
        Array.isArray(results),
        results.length !== 0,
      ];
      return tests.every((test) => !!test);
    },
  });
}
