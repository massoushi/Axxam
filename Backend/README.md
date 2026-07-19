# Backend AXXAM (Express)

API Node.js pour la plateforme immobilière & hébergement.

## Démarrage

```bash
cd backend
npm install
npm run dev
```

API : `http://localhost:5000`

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Santé du serveur |
| GET | `/api/properties` | Liste des biens (`?city=&type=&minPrice=&maxPrice=`) |
| GET | `/api/properties/:id` | Détail d'un bien |
| POST | `/api/auth/login` | Connexion (placeholder) |
| POST | `/api/auth/register` | Inscription (placeholder) |

## Structure

```
src/
  config/        # variables d'environnement
  controllers/   # logique métier
  data/          # données mock (temporaire)
  middleware/    # erreurs, 404
  routes/        # routes Express
  app.js         # configuration Express
  server.js      # point d'entrée
```

## Suite prévue

- Base de données (MongoDB ou PostgreSQL)
- Auth JWT réelle
- Réservations, messages, espaces propriétaire / agence / admin
