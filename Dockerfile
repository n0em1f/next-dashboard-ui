# 1. Imaginea de bază cu Node.js
FROM node:20-alpine

# 2. Setăm folderul de lucru în container
WORKDIR /app

# 3. Copiem fișierele de dependențe
COPY package*.json ./
COPY prisma ./prisma/

# 4. Instalăm TOATE dependențele (inclusiv cele de dev, necesare pentru build-ul de Next/TypeScript)
RUN npm ci

# 5. Generăm clientul Prisma (foarte important pentru baza de date)
RUN npx prisma generate

# 6. Copiem restul codului din proiect
COPY . .

# 7. Dezactivăm colectarea de date anonime de la Next.js (opțional, dar recomandat)
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 8. Rulăm procesul de build pentru a compila proiectul Next.js
RUN npm run build

# 9. Pornim aplicația în modul de producție
CMD ["npm", "start"]

CMD npx prisma migrate deploy && npm start