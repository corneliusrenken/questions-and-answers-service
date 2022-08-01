/* eslint-disable no-multiple-empty-lines */
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
module.exports.getQuestions = (product_id, page, count) => (
  pool
    .connect()
    .then((client) => (
      client
        // although api doesn't require it, could still figure out how to order each
        // question by helpfulness
        .query(`
        WITH qs AS (
          SELECT
            *
          FROM
            questions q
          WHERE
            product_id = $1
          AND
            reported = false
          ORDER BY
            helpfulness DESC
          LIMIT $2 OFFSET $3
        ), ans AS (
          SELECT
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
            (SELECT a.* FROM answers a, qs WHERE a.question_id = qs.id AND a.reported = false) AS a
          LEFT JOIN
            answers_photos a_p
          ON
            a_p.answer_id = a.id
          GROUP BY
            a.id,
            a.body,
            a.created_at,
            a.username,
            a.helpfulness,
            a.question_id
        )
        SELECT
          qs.id AS question_id,
          qs.body AS question_body,
          qs.created_at AS question_date,
          qs.username AS asker_name,
          qs.helpfulness AS question_helpfulness,
          qs.reported AS reported,
          COALESCE(
            json_object_agg(
              ans.id,
              (SELECT rows FROM (SELECT
                ans.id,
                ans.body,
                ans.created_at AS date,
                ans.username AS answerer_name,
                ans.helpfulness,
                ans.photos
              ) AS rows)
            )
          FILTER (WHERE ans.id IS NOT NULL), '{}') AS answers
        FROM
          qs,
          ans
        GROUP BY
          qs.id,
          qs.body,
          qs.created_at,
          qs.username,
          qs.helpfulness,
          qs.reported
        ORDER BY
          qs.helpfulness DESC
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
            page: Number(page),
            count: Number(count),
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
module.exports.addAnswer = (question_id, body, name, email, photos = []) => {
  const queryText = photos.length === 0
    ? `
    INSERT INTO answers (question_id, body, username, email)
    VALUES ($1, $2, $3, $4)
    `
    : `
    WITH new_answer AS (
    INSERT INTO answers (question_id, body, username, email)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    )
    INSERT INTO answers_photos (answer_id, url)
    VALUES
    ${photos.map((photo, index) => `((SELECT id FROM new_answer), $${5 + index})`)}
    `;
  return pool
    .connect()
    .then((client) => (
      client
        .query(queryText, [question_id, body, name, email, ...photos])
        .then(() => {
          client.release();
        })
    ));
};

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
