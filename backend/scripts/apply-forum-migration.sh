

echo "🔧 Application de la migration du forum..."

if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_PORT" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_DB" ]; then
    echo "❌ Variables d'environnement PostgreSQL manquantes"
    echo "Assurez-vous que POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_DB sont définies"
    exit 1
fi

# Appliquer la migration
echo "📝 Application du schéma du forum..."
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f src/db/migration/forum.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration du forum appliquée avec succès!"
    echo "📊 Tables créées:"
    echo "   - forums"
    echo "   - topics" 
    echo "   - posts"
    echo "   - Index et triggers"
    echo "   - Forums par défaut"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi 