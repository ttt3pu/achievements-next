setup:
	cd prisma; docker compose up -d --wait
	pnpm install
	pnpm prisma migrate dev
	pnpm prisma generate
	$(MAKE) test-db
dev:
	cd prisma; docker compose up -d --wait
	pnpm dev
test-db:
	cd prisma; docker compose up -d --wait
	cd prisma; docker compose exec -T db psql -U root -d postgres -c 'CREATE DATABASE attt_test' || true
	DATABASE_URL=$${TEST_DATABASE_URL:?.envrc に TEST_DATABASE_URL を設定してください} pnpm prisma migrate deploy
