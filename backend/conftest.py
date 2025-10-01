import os
from pathlib import Path

# Force pytest runs to use a lightweight SQLite database to avoid creating throwaway
# PostgreSQL databases (which require elevated privileges in some environments).
sqlite_path = Path(__file__).resolve().parent / "test_db.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{sqlite_path}"

# Remove Postgres-specific overrides so Django settings fall back to the SQLite URL above.
for key in [
	"POSTGRES_DB",
	"POSTGRES_USER",
	"POSTGRES_PASSWORD",
	"POSTGRES_HOST",
	"POSTGRES_PORT",
]:
	os.environ.pop(key, None)
