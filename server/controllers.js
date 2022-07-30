/* eslint-disable camelcase */
const models = require('./models');

module.exports.getQuestions = (req, res) => {
  const { product_id } = req.query;
  let { page, count } = req.query;
  page = req.query.page !== undefined ? req.query.page : 1;
  count = req.query.count !== undefined ? req.query.count : 5;
  if (
    Number.isNaN(Number(product_id))
    || Number.isNaN(Number(page))
    || Number.isNaN(Number(count))
  ) {
    res.status(400).send('BAD INPUT');
  } else {
    models.getQuestions(product_id, page, count)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.getAnswers = (req, res) => {
  const { question_id } = req.params;
  let { page, count } = req.query;
  page = req.query.page !== undefined ? req.query.page : 1;
  count = req.query.count !== undefined ? req.query.count : 5;
  if (
    Number.isNaN(Number(question_id))
    || Number.isNaN(Number(page))
    || Number.isNaN(Number(count))
  ) {
    res.status(400).send('BAD INPUT');
  } else {
    models.getAnswers(question_id, page, count)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.addQuestion = (req, res) => {
  const {
    body, name, email, product_id,
  } = req.body;
  if (
    body === undefined
    || name === undefined
    || email === undefined
    || product_id === undefined
  ) {
    res.status(400).send('BAD INPUT');
  } else {
    models.addQuestion(product_id, body, name, email)
      .then(() => {
        res.status(201).send('Created');
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.addAnswer = (req, res) => {
  const { question_id } = req.params;
  const {
    body, name, email, photos,
  } = req.body;
  if (
    Number.isNaN(Number(question_id))
    || body === undefined
    || name === undefined
    || email === undefined
    || photos === undefined
  ) {
    res.status(400).send('BAD INPUT');
  } else {
    models.addAnswer(question_id, body, name, email, photos)
      .then(() => {
        res.status(201).send('Created');
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.markQuestionAsHelpful = (req, res) => {
  const { question_id } = req.params;
  if (Number.isNaN(Number(question_id))) {
    res.status(400).send('BAD INPUT');
  } else {
    models.markQuestionAsHelpful(question_id)
      .then(() => {
        res.status(204).end();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.reportQuestion = (req, res) => {
  const { question_id } = req.params;
  if (Number.isNaN(Number(question_id))) {
    res.status(400).send('BAD INPUT');
  } else {
    models.reportQuestion(question_id)
      .then(() => {
        res.status(204).end();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.markAnswerAsHelpful = (req, res) => {
  const { answer_id } = req.params;
  if (Number.isNaN(Number(answer_id))) {
    res.status(400).send('BAD INPUT');
  } else {
    models.markAnswerAsHelpful(answer_id)
      .then(() => {
        res.status(204).end();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};

module.exports.reportAnswer = (req, res) => {
  const { answer_id } = req.params;
  if (Number.isNaN(Number(answer_id))) {
    res.status(400).send('BAD INPUT');
  } else {
    models.reportAnswer(answer_id)
      .then(() => {
        res.status(204).end();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
};
