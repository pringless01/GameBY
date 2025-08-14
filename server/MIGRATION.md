# Migrations

Run pending migrations:

```bash
npm run migrate
```

Included migration files:

- `017_add_idempotency_keys.sql`
- `018_enforce_non_negative_money.sql`
- `019_create_marketplace_listings.sql`
- `020_create_chat_spam_history.sql`

Rollback (if needed) can be done by restoring database from backup; no automated down scripts are provided.
