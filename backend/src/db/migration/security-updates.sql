-- Migration pour ajouter les colonnes de sécurité anti-abus

-- Ajouter email_verified et created_at à la table users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='email_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END
$$;

-- Ajouter email_verification_token à la table users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='email_verification_token'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
  END IF;
END
$$;

-- Ajouter email_verification_expires à la table users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='email_verification_expires'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP;
  END IF;
END
$$;

-- Créer un index sur email_verification_token pour les performances
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Créer un index sur created_at pour les requêtes de limitation
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at); 