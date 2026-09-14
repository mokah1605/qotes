# Prisma migrations

The live Turso database predates Prisma migrations. Do **not** run `prisma migrate deploy`
against it until it has been baselined, otherwise Prisma will try to create tables that
already exist.

For the existing production database, first create an initial migration from the current
schema, then mark that migration as already applied:

```sh
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/00000000000000_initial/migration.sql
npx prisma migrate resolve --applied 00000000000000_initial
```

For every later schema change, use `npx prisma migrate dev --name <description>` locally,
commit the generated migration, and deploy it with `npx prisma migrate deploy`.
