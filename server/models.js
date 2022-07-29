/* eslint-disable camelcase */
const { Pool } = require('pg');

const pool = new Pool({
  database: 'questions_and_answers',
});

// questions list
// retrieves a list of questions for a particular product
// *does not* include any reported questions (or answers???)
// sorted by helpfulness
// query parameters:
// - product_id: integer
// - page: integer (default 1)
// - count: integer (default 5)

// module.exports.getQuestions = (product_id, page, count) => {
//   pool
//     .connect()
//     .then((client) => (
//       client
//         .query(`
//         SELECT questions.body AS q_body, answers.body AS a_body FROM
//         (SELECT * FROM questions q
//         WHERE q.reported = false AND q.product_id = $1
//         ORDER BY helpfulness DESC
//         LIMIT $2 OFFSET $3) AS questions
//         LEFT JOIN
//         (SELECT * FROM answers
//         WHERE answers.reported = false) AS answers
//         ON answers.question_id = questions.id
//         ORDER BY questions.helpfulness DESC
//         `, [product_id, count, (page - 1) * count])
//         .then((res) => {
//           client.release();
//           console.log(res.rows);
//         })
//         .catch((err) => {
//           client.release();
//           console.error(err);
//         })
//     ));
// };

// answers list
// returns answers for a given question
// *does not* include any reported answers
// sorted by helpfulness
// parameters:
// - question_id: integer
// query parameters:
// - page: integer (default 1)
// - count: integer (default 5)
module.exports.getAnswers = (question_id, page, count) => {
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        SELECT
          a.id AS answer_id,
          a.body,
          a.created_at AS date,
          a.username AS answerer_name,
          a.helpfulness,
          COALESCE(json_agg(
            (SELECT rows FROM (SELECT a_p.id, a_p.url) AS rows) ORDER BY a_p.id ASC
          ) FILTER (WHERE a_p.id IS NOT NULL), '[]') AS photos
        FROM
        ( SELECT
            *
          FROM
            answers
          WHERE
            reported = false
          AND
            question_id = $1
          ORDER BY
            helpfulness DESC
          LIMIT $2 OFFSET $3
        ) AS a
        LEFT JOIN
        ( SELECT
           *
          FROM
            answers_photos
        ) AS a_p
        ON
          a.id = a_p.answer_id
        GROUP BY
          a.id,
          a.body,
          a.created_at,
          a.username,
          a.helpfulness
        ORDER BY
          a.helpfulness DESC
        `, [question_id, count, (page - 1) * count])
        .then((res) => {
          client.release();
          const response = {
            question: question_id.toString(),
            page,
            count,
            results: res.rows,
          };
          console.log('\n\n\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~:\n', response);
          console.log('\n\n\n\n\n1:\n', res.rows[0]);
          console.log('\n\n\n\n\n2:\n', res.rows[1]);
          console.log('\n\n\n\n\n3:\n', res.rows[2]);
          console.log('\n\n\n\n\n4:\n', res.rows[3]);
          console.log('\n\n\n\n\n5:\n', res.rows[4]);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// add a question
// body:
// - body: string (text of q being asked)
// - name: string (username of asker)
// - email: string (email of asker)
// - product_id: integer
module.exports.addQuestion = (product_id, body, name, email) => {
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        INSERT INTO questions (product_id, body, username, email)
        VALUES ($1, $2, $3, $4)
        `, [product_id, body, name, email])
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// add an answer
// parameters:
// - question_id: integer
// body:
// - body: string (text of q being asked)
// - name: string (username of asker)
// - email: string (email of asker)
// - photos: array of strings
module.exports.addAnswer = (question_id, body, name, email, photos) => {
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        INSERT INTO answers (question_id, body, username, email)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `, [question_id, body, name, email])
        .then((res) => (client.query(`
          INSERT INTO answers_photos (answer_id, url)
          VALUES
          ${photos.map((photo, index) => `($1, $${2 + index})`)}
          `, [res.rows[0].id, ...photos])
        ))
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// mark question as helpful
// parameters:
// - question_id: integer
module.exports.markQuestionAsHelpful = (question_id) => {
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE questions SET helpfulness = helpfulness + 1 WHERE id = $1', [question_id])
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// report question
// parameters:
// - question_id: integer
module.exports.reportQuestion = (question_id) => {
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE questions SET reported = true WHERE id = $1', [question_id])
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// mark answer as helpful
// parameters:
// - answer_id: integer
module.exports.markAnswerAsHelpful = (answer_id) => {
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE answers SET helpfulness = helpfulness + 1 WHERE id = $1', [answer_id])
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};

// report answer
// parameters:
// - answer_id: integer
module.exports.reportAnswer = (answer_id) => {
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE answers SET reported = true WHERE id = $1', [answer_id])
        .then((res) => {
          client.release();
          console.log(res.rows);
        })
        .catch((err) => {
          client.release();
          console.error(err);
        })
    ));
};
// question_id, body, name, email, photos
console.log(module.exports.getAnswers(1, 2, 5));
