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
