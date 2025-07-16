CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    avatar TEXT,
    bio TEXT,
    credits INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='subscribed'
  ) THEN
    ALTER TABLE users ADD COLUMN subscribed BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='unsubscribed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN unsubscribed_at TIMESTAMP;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exchanges (
    id SERIAL PRIMARY KEY,
    initiator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    initiator_confirmed BOOLEAN DEFAULT FALSE,
    recipient_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(initiator_id, recipient_id, description)
);

CREATE INDEX IF NOT EXISTS idx_exchanges_initiator ON exchanges(initiator_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_recipient ON exchanges(recipient_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);

CREATE TABLE IF NOT EXISTS profile_ratings (
    id SERIAL PRIMARY KEY,
    rater_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    exchange_id INTEGER NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (rater_id, rated_user_id, exchange_id),
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    communication INTEGER CHECK (communication >= 1 AND communication <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5)
);

CREATE INDEX IF NOT EXISTS idx_profile_ratings_exchange ON profile_ratings(exchange_id);

-- Migration pour ajouter exchange_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profile_ratings' AND column_name = 'exchange_id'
    ) THEN
        ALTER TABLE profile_ratings ADD COLUMN exchange_id INTEGER REFERENCES exchanges(id) ON DELETE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'profile_ratings_rater_id_rated_user_id_key'
    ) THEN
        ALTER TABLE profile_ratings DROP CONSTRAINT profile_ratings_rater_id_rated_user_id_key;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profile_ratings_rater_id_rated_user_id_exchange_id_key'
    ) THEN
        ALTER TABLE profile_ratings
            ADD CONSTRAINT profile_ratings_rater_id_rated_user_id_exchange_id_key UNIQUE (rater_id, rated_user_id, exchange_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'exchanges_initiator_id_recipient_id_description_key'
    ) THEN
        ALTER TABLE exchanges DROP CONSTRAINT exchanges_initiator_id_recipient_id_description_key;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
