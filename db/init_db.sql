-- Schema creation
CREATE SCHEMA IF NOT EXISTS todoapp;

-- Switch to the schema
SET search_path TO todoapp;

-- Create 'user' table
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  prenom VARCHAR(50) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create 'task' table
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  libelle TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Create user (PostgreSQL-style)
DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'todoappuser') THEN

      RAISE NOTICE 'Role "todoappuser" already exists. Skipping.';
   ELSE
      CREATE ROLE todoappuser LOGIN PASSWORD 'Ynov2025@todoapp';
   END IF;
END
$do$;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA todoapp TO todoappuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA todoapp TO todoappuser;
