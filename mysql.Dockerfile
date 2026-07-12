FROM mysql:8.0

# Copy SQL initialization scripts
COPY sql/schema.sql /docker-entrypoint-initdb.d/1-schema.sql
COPY sql/users.sql /docker-entrypoint-initdb.d/2-users.sql
COPY sql/seed.sql /docker-entrypoint-initdb.d/3-seed.sql

EXPOSE 3306
