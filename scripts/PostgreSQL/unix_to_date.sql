ALTER TABLE questions
ALTER COLUMN created_at TYPE timestamp
USING TO_TIMESTAMP(created_at / 1000);

ALTER TABLE answers
ALTER COLUMN created_at TYPE timestamp
USING TO_TIMESTAMP(created_at / 1000);
