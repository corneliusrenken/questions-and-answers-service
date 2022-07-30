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

// json_agg(full_answers) AS answers

module.exports.getQuestions = (product_id, page, count) => (
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        SELECT
          filtered_questions.id AS question_id,
          filtered_questions.body AS question_body,
          filtered_questions.created_at AS question_date,
          filtered_questions.username AS asker_name,
          filtered_questions.helpfulness AS question_helpfulness,
          filtered_questions.reported AS reported,
          COALESCE(json_agg(
            (SELECT rows FROM (SELECT
              full_answers.id,
              full_answers.body,
              full_answers.created_at AS date,
              full_answers.username AS answerer_name,
              full_answers.helpfulness,
              full_answers.photos
            ) AS rows) ORDER BY full_answers.helpfulness DESC
          ) FILTER (WHERE full_answers.id IS NOT NULL), '[]') AS answers
        FROM
        ( SELECT
            *
          FROM
            questions
          WHERE
            product_id = $1
          AND
            reported = false
          ORDER BY
            helpfulness DESC
          LIMIT $2 OFFSET $3
        ) AS filtered_questions
        LEFT JOIN
        ( SELECT
            a.id,
            a.body,
            a.created_at,
            a.username,
            a.helpfulness,
            a.question_id,
            COALESCE(json_agg(
              (SELECT rows FROM (SELECT a_p.id, a_p.url) AS rows) ORDER BY a_p.id ASC
            ) FILTER (WHERE a_p.id IS NOT NULL), '[]') AS photos
          FROM
          (
            SELECT
              *
            FROM
              answers
            WHERE
              reported = false
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
            a.question_id,
            a.body,
            a.created_at,
            a.username,
            a.email,
            a.reported,
            a.helpfulness
          ORDER BY
            a.helpfulness DESC
        ) AS full_answers
        ON
          full_answers.question_id = filtered_questions.id
        GROUP BY
          filtered_questions.id,
          filtered_questions.body,
          filtered_questions.created_at,
          filtered_questions.username,
          filtered_questions.helpfulness,
          filtered_questions.reported
        ORDER BY
          filtered_questions.helpfulness DESC
        `, [product_id, count, (page - 1) * count])
        .then((res) => {
          client.release();
          const response = {
            product_id,
            results: res.rows,
          };
          return response;
        })
    ))
);

// module.exports.getQuestions(1, 1, 1);

// answers list
// returns answers for a given question
// *does not* include any reported answers
// sorted by helpfulness
// parameters:
// - question_id: integer
// query parameters:
// - page: integer (default 1)
// - count: integer (default 5)
module.exports.getAnswers = (question_id, page, count) => (
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
            question_id = $1
          AND
            reported = false
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
          return response;
        })
    ))
);

// add a question
// body:
// - body: string (text of q being asked)
// - name: string (username of asker)
// - email: string (email of asker)
// - product_id: integer
module.exports.addQuestion = (product_id, body, name, email) => (
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        INSERT INTO questions (product_id, body, username, email)
        VALUES ($1, $2, $3, $4)
        `, [product_id, body, name, email])
        .then(() => {
          client.release();
        })
    ))
);

// add an answer
// parameters:
// - question_id: integer
// body:
// - body: string (text of q being asked)
// - name: string (username of asker)
// - email: string (email of asker)
// - photos: array of strings
module.exports.addAnswer = (question_id, body, name, email, photos) => (
  pool
    .connect()
    .then((client) => (
      client
        .query(`
        WITH new_answer AS (
        INSERT INTO answers (question_id, body, username, email)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        )
        INSERT INTO answers_photos (answer_id, url)
        VALUES
        ${photos.map((photo, index) => `((SELECT id FROM new_answer), $${5 + index})`)}
        `, [question_id, body, name, email, ...photos])
        .then(() => {
          client.release();
        })
    ))
);

// mark question as helpful
// parameters:
// - question_id: integer
module.exports.markQuestionAsHelpful = (question_id) => (
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE questions SET helpfulness = helpfulness + 1 WHERE id = $1', [question_id])
        .then(() => {
          client.release();
        })
    ))
);

// report question
// parameters:
// - question_id: integer
module.exports.reportQuestion = (question_id) => (
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE questions SET reported = true WHERE id = $1', [question_id])
        .then(() => {
          client.release();
        })
    ))
);

// mark answer as helpful
// parameters:
// - answer_id: integer
module.exports.markAnswerAsHelpful = (answer_id) => (
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE answers SET helpfulness = helpfulness + 1 WHERE id = $1', [answer_id])
        .then(() => {
          client.release();
        })
    ))
);

// report answer
// parameters:
// - answer_id: integer
module.exports.reportAnswer = (answer_id) => (
  pool
    .connect()
    .then((client) => (
      client
        .query('UPDATE answers SET reported = true WHERE id = $1', [answer_id])
        .then(() => {
          client.release();
        })
    ))
);
