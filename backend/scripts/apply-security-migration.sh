#!/bin/bash

# Script pour appliquer la migration de sécurité anti-abus

echo "🔒 Application de la migration de sécurité anti-abus..."

# Variables d'environnement
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-swipemytalent_db}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Vérifier si les variables d'environnement sont définies
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erreur: DB_PASSWORD n'est pas défini"
    exit 1
fi

echo "📊 Connexion à la base de données..."
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Appliquer la migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../src/db/migration/security-updates.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration de sécurité appliquée avec succès!"
    echo ""
    echo "🛡️ Nouvelles fonctionnalités activées :"
    echo "   - Vérification d'email obligatoire"
    echo "   - Blocage des emails temporaires"
    echo "   - Délai de 24h avant notation"
    echo "   - Détection des comptes multiples"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi 