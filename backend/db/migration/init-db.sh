#!/bin/sh
set -e

POSTGRES_DB=$(cat "$POSTGRES_DB_FILE")
POSTGRES_USER=$(cat "$POSTGRES_USER_FILE")
PGPASSWORD=$(cat "$POSTGRES_PASSWORD_FILE")
export PGPASSWORD

echo "Waiting for PostgreSQL to become available..."
until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER"; do
    sleep 2
done

echo "Checking if database '$POSTGRES_DB' exists..."
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 ||
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB"

echo "Applying schema to database '$POSTGRES_DB'..."
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /init/init.sql
