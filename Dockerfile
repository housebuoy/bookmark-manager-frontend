# Stage 1: install + build
FROM node:20-alpine AS nextjs_builder

ARG BETTER_AUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG DATABASE_URL

# Set them as environment variables for the build process
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV DATABASE_URL=$DATABASE_URL

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --prefer-offline --no-audit || \
    =npm ci --ignore-scripts --prefer-offline --no-audit || \
    (rm -rf node_modules package-lock.json && npm install --ignore-scripts) 

# --- CRITICAL FIX FOR NATIVE MODULES ---
# Force optional packages installation and rebuild the lightningcss module
RUN npm install --include=optional && npm rebuild lightningcss
# ----------------------------------------

COPY prisma ./prisma 
COPY prisma.config.ts ./
COPY . .
RUN npm run build 
# All necessary files (including prisma/schema.prisma) are now in /app

# Stage 2: production runner
FROM node:20-alpine AS runner
WORKDIR /app

# 1. Add the non-root user first
RUN adduser -D nextjsuser

# Copy build output from the builder stage (These are now guaranteed to work)
COPY --from=nextjs_builder /app/.next/standalone ./
COPY --from=nextjs_builder /app/.next/static ./.next/static
COPY --from=nextjs_builder /app/public ./public
COPY --from=nextjs_builder /app/node_modules ./node_modules
COPY --from=nextjs_builder /app/prisma.config.ts ./
COPY --from=nextjs_builder /app/prisma ./prisma
COPY --from=nextjs_builder /usr/lib/libssl.so.3 /usr/lib/
COPY --from=nextjs_builder /usr/lib/libcrypto.so.3 /usr/lib/

# Copy start.sh and make it executable (while still root)
COPY start.sh ./
RUN chmod +x start.sh

# 2. CRITICAL STEP: Change ownership of the entire application directory
RUN chown -R nextjsuser:nextjsuser /app

# 3. Now switch to the non-root user
USER nextjsuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["./start.sh"]