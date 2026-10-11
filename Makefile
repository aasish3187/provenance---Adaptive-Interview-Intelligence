.PHONY: dev test check format lint clean

dev-api:
	cd apps/api && python -m uvicorn main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev

dev:
	@echo "To start services, run 'make dev-api' in one terminal and 'make dev-web' in another."

test-api:
	python -m pytest -v

eval-golden:
	python evals/runner.py

test-web:
	cd apps/web && npm run build

test: test-api eval-golden test-web

lint-api:
	python -m ruff check apps/api

lint-web:
	cd apps/web && npm run lint

check: test-api eval-golden
	@echo "All checks and release gates passed successfully."

format:
	cd apps/api && python -m ruff format .
	cd apps/web && npm run format

clean:
	rm -rf apps/web/.next apps/web/node_modules apps/api/__pycache__ .pytest_cache
