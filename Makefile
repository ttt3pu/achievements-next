setup:
	cd prisma; docker compose up -d --wait
	pnpm install
	pnpm prisma migrate dev
	pnpm prisma generate
dev:
	cd prisma; docker compose up -d --wait
	pnpm dev
