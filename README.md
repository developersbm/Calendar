# Steps
Downgrade React
npm install react@18 react-dom@18

command 1 : npm i @mui/material @emotion/react @emotion/styled lucide-react numeral date-fns axios recharts react-dnd react-dnd-html5-backend gantt-task-react
command 2:  npm i @mui/x-data-grid
command 3:  npm i -D @types/node @types/uuid @types/numeral

command 4: npm i -D prettier prettier-plugin-tailwindcss
command 5: npm i -D tailwind-merge

tailwind.config.ts
// For darkmode & custom colors

Redux - NextJS
redux-persist - Keeps local storage persistent
1. npm i react-redux @reduxjs/toolkit redux-persist dotenv

PostgreSQL
1. npm init -y (Create package.json)
2. npm i -D ts-node typescript @types/node
3. npx tsc --init
4. npm i prisma @prisma/client
5. npx prisma init

Seed Data is mock data (Testing)

Install PostgreSQL
sudo apt update
sudo apt install postgresql
- pg_isready (Check if connections is ready)

1. npx prisma generate
2. npx prisma migrate dev --name init
3. npm run seed

Backend
1. npm i express body-parser cors dotenv helmet morgan
2. npm i -D rimraf concurrently nodemon @types/cors @types/express @types/morgan @types/node

nvm use node


Kill port:
lsof -i :8000
kill -9 PID

- Enterprise
1. Remove gitignores
2. rm -rf .git from client
3. ```