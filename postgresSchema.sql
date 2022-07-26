CREATE TABLE IF NOT EXISTS questions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id integer NOT NULL,
  body varchar(1000) NOT NULL,
  created_at timestamp NOT NULL,
  username varchar(60) NOT NULL,
  email varchar(60) NOT NULL,
  helpfulness integer DEFAULT 0,
  reported boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS answers (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id integer REFERENCES questions(id) NOT NULL,
  body varchar(1000) NOT NULL,
  created_at timestamp NOT NULL,
  username varchar(60) NOT NULL,
  email varchar(60) NOT NULL,
  helpfulness integer DEFAULT 0,
  photos text[5] DEFAULT ARRAY[]::text[]
);
