// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { sleep } from 'k6';

export const options = {
  stages: [
    // { target: 1, duration: '10s' },
    // { target: 10, duration: '10s' },
    // { target: 100, duration: '10s' },
    { target: 1000, duration: '30s' },
  ],
};

export default function () {
  http.get('http://localhost:6246/qa/questions?product_id=1000011&count=10');
  sleep(1);
}
