#!/bin/sh

# Ensure DATABASE_URL is set in your Docker Compose or environment for this step.
echo "Running Prisma migrations..."
# Using exec ensures the shell process is replaced by the Prisma process, 
# improving signal handling (though not strictly necessary here).
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Generating Prisma Client..."
# Redundant if copied from builder, but good for safety.
npx prisma generate

echo "Starting Next.js server..."
# Use the correct path for the Next.js standalone server
exec node /app/server.js