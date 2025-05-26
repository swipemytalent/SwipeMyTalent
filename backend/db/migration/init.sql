SELECT 'CREATE DATABASE my_database'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'my_database'
)\gexec

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    avatar TEXT,
    credits INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0
);