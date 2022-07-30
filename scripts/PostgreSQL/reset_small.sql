DROP TABLE IF EXISTS answers_photos;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;

CREATE TABLE IF NOT EXISTS questions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id integer NOT NULL,
  body varchar(1000) NOT NULL,
  created_at bigint NOT NULL,
  username varchar(60) NOT NULL,
  email varchar(60) NOT NULL,
  reported boolean DEFAULT false,
  helpfulness integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id integer REFERENCES questions(id) NOT NULL,
  body varchar(1000) NOT NULL,
  created_at bigint NOT NULL,
  username varchar(60) NOT NULL,
  email varchar(60) NOT NULL,
  reported boolean DEFAULT false,
  helpfulness integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers_photos (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  answer_id integer REFERENCES answers(id) NOT NULL,
  url text NOT NULL
);

COPY questions
FROM '/Users/home/Hack Reactor/Immersive/SDC/QuestionsAndAnswersService/data/small/questions.csv'
DELIMITER ','
CSV HEADER;

COPY answers
FROM '/Users/home/Hack Reactor/Immersive/SDC/QuestionsAndAnswersService/data/small/answers.csv'
DELIMITER ','
CSV HEADER;

COPY answers_photos
FROM '/Users/home/Hack Reactor/Immersive/SDC/QuestionsAndAnswersService/data/small/answers_photos.csv'
DELIMITER ','
CSV HEADER;

ALTER TABLE questions
ALTER COLUMN created_at TYPE timestamp with time zone
USING TO_TIMESTAMP(created_at / 1000);

ALTER TABLE answers
ALTER COLUMN created_at TYPE timestamp with time zone
USING TO_TIMESTAMP(created_at / 1000);

ALTER TABLE questions
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE answers
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

SELECT setval('questions_id_seq', max(id)) FROM answers;
SELECT setval('answers_id_seq', max(id)) FROM answers;
SELECT setval('answers_photos_id_seq', max(id)) FROM answers;

CREATE INDEX answers_question_id_hash ON answers USING HASH (question_id);
CREATE INDEX answers_photos_answer_id_hash ON answers_photos USING HASH (answer_id);
CREATE INDEX questions_product_id_hash ON questions USING HASH (product_id);
