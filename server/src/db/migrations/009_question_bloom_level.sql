-- Adds the optional Bloom's taxonomy level to questions. Only the first three
-- levels of the revised taxonomy are offered. AI-generated questions are
-- tagged automatically; manually authored questions may leave it NULL.
ALTER TABLE questions ADD COLUMN bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply'));
