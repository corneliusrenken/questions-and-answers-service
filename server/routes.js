const router = require('express').Router();
const controllers = require('./controllers');

router.get('/qa/questions', controllers.getQuestions);

router.get('/qa/questions/:question_id/answers', controllers.getAnswers);

router.post('/qa/questions', controllers.addQuestion);

router.post('/qa/questions/:question_id/answers', controllers.addAnswer);

router.put('/qa/questions/:question_id/helpful', controllers.markQuestionAsHelpful);

router.put('/qa/questions/:question_id/report', controllers.reportQuestion);

router.put('/qa/answers/:answer_id/helpful', controllers.markAnswerAsHelpful);

router.put('/qa/answers/:answer_id/report', controllers.reportAnswer);

module.exports = router;
