/* eslint-disable no-undef */
const request = require('supertest')('http://localhost:6246');

describe('Get Questions', () => {
  test('Get Questions', () => (
    request
      .get('/qa/questions?product_id=1')
      .expect(200)
      .then((res) => {
        const { body } = res;
        const { results } = body;
        expect(body.product_id).toBe('1');
        expect(Array.isArray(results)).toBe(true);
        const question = results[0];
        console.log(question);
        expect(typeof question.question_id).toBe('number');
        expect(typeof question.question_body).toBe('string');
        expect(typeof question.question_date).toBe('string');
        expect(typeof question.asker_name).toBe('string');
        expect(typeof question.question_helpfulness).toBe('number');
        expect(typeof question.reported).toBe('boolean');
        const { answers } = question;
        expect(!Array.isArray(answers) && typeof answers === 'object').toBe(true);
        Object.keys(answers).forEach((key) => {
          expect(Number(key)).not.toBe(NaN);
        });
        const answer = answers[Object.keys(answers)[0]];
        expect(typeof answer.id).toBe('number');
        expect(typeof answer.body).toBe('string');
        expect(typeof answer.date).toBe('string');
        expect(typeof answer.answerer_name).toBe('string');
        expect(typeof answer.helpfulness).toBe('number');
        expect(Array.isArray(answer.photos)).toBe(true);
      })
  ));
});

describe('Get Answers', () => {
  test('Returns the correct format', () => (
    request
      .get('/qa/questions/1/answers?page=1&count=5')
      .expect(200)
      .then((res) => {
        const { body } = res;
        const { results } = body;
        expect(body.question).toBe('1');
        expect(body.page).toBe(1);
        expect(body.count).toBe(5);
        expect(Array.isArray(results)).toBe(true);
        const answer = results[3]; // contains photos
        expect(typeof answer.answer_id).toBe('number');
        expect(typeof answer.body).toBe('string');
        expect(typeof answer.date).toBe('string');
        expect(typeof answer.answerer_name).toBe('string');
        expect(typeof answer.helpfulness).toBe('number');
        expect(Array.isArray(answer.photos)).toBe(true);
        expect(typeof answer.photos[0].id).toBe('number');
        expect(typeof answer.photos[0].url).toBe('string');
      })
  ));

  test('Returns the specified count', () => {
    const countOne = request
      .get('/qa/questions/1/answers?page=1&count=1')
      .expect(200)
      .then((res) => {
        const { body } = res;
        const { results } = body;
        expect(results.length).toBe(1);
      });
    const countTwo = request
      .get('/qa/questions/1/answers?page=1&count=2')
      .expect(200)
      .then((res) => {
        const { body } = res;
        const { results } = body;
        expect(results.length).toBe(2);
      });
    return Promise.all([countOne, countTwo]);
  });
});
