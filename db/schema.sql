-- Vatan Press · схема Neon PostgreSQL
-- Запуск: npm run db:migrate

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(20)  NOT NULL DEFAULT 'reader',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id        SERIAL PRIMARY KEY,
  slug      VARCHAR(50)  UNIQUE NOT NULL,
  name_ru   VARCHAR(100) NOT NULL,
  name_uz   VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS publications (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  title_ru        VARCHAR(255) NOT NULL,
  title_uz        VARCHAR(255) NOT NULL,
  description_ru  TEXT NOT NULL,
  description_uz  TEXT NOT NULL,
  cover_url       TEXT NOT NULL,
  category_id     INT  NOT NULL REFERENCES categories(id),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('newspaper','magazine')),
  price_per_month INT  NOT NULL CHECK (price_per_month >= 0),
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id             SERIAL PRIMARY KEY,
  publication_id INT  NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  issue_number   INT  NOT NULL,
  title_ru       VARCHAR(255),
  title_uz       VARCHAR(255),
  published_at   DATE NOT NULL,
  pdf_url        TEXT NOT NULL,
  cover_url      TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (publication_id, issue_number)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id             SERIAL PRIMARY KEY,
  user_id        INT  NOT NULL REFERENCES users(id),
  publication_id INT  NOT NULL REFERENCES publications(id),
  period_months  INT  NOT NULL CHECK (period_months IN (1,3,12)),
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  status         VARCHAR(20) NOT NULL CHECK (status IN ('pending','active','expired','cancelled')),
  total_amount   INT  NOT NULL CHECK (total_amount >= 0),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id              SERIAL PRIMARY KEY,
  subscription_id INT  NOT NULL REFERENCES subscriptions(id),
  amount          INT  NOT NULL CHECK (amount >= 0),
  card_last4      VARCHAR(4) NOT NULL,
  status          VARCHAR(20) NOT NULL CHECK (status IN ('success','failed')),
  paid_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_pub_published ON issues(publication_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_cat_pub ON publications(category_id, is_published);
