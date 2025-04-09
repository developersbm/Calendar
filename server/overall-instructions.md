

# EC2 Setup Instructions

## 1. Connect to EC2 Instance via EC2 Instance Connect

## 2. Install Node Version Manager (nvm) and Node.js

- **Switch to superuser and install nvm:**

  ```
  sudo su -
  ```

  ```
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  ```

- **Activate nvm:**

  ```
  . ~/.nvm/nvm.sh
  ```

- **Install the latest version of Node.js using nvm:**

  ```
  nvm install node
  ```

- **Verify that Node.js and npm are installed:**

  ```
  node -v
  ```

  ```
  npm -v
  ```

## 3. Install Git

- **Update the system and install Git:**

  ```
  sudo yum update -y
  ```

  ```
  sudo yum install git -y
  ```

- **Check Git version:**

  ```
  git --version
  ```

- **Clone your code repository from GitHub:**

  ```
  git clone [your-github-link]
  ```

- **Navigate to the directory and install packages:**

  ```
  cd project-management
  ```

  ```
  cd server
  ```

  ```
  npm i
  ```

- **Create Env File and Port 80:**

  ```
  echo "PORT=80" > .env
  ```

- **Start the application:**
  ```
  npm run dev
  ```

## 4. Install pm2 (Production Process Manager for Node.js)

- **Install pm2 globally:**

  ```
  npm i pm2 -g
  ```

- **Create a pm2 ecosystem configuration file (inside server directory):**

  ```
  module.exports = { apps : [{ name: 'inventory-management', script: 'npm', args: 'run dev', env: { NODE_ENV: 'development', ENV_VAR1: 'environment-variable', } }], };
  ```

- **Modify the ecosystem file if necessary:**

  ```
  nano ecosystem.config.js
  ```

- **Set pm2 to restart automatically on system reboot:**

  ```
  sudo env PATH=$PATH:$(which node) $(which pm2) startup systemd -u $USER --hp $(eval echo ~$USER)
  ```

- **Start the application using the pm2 ecosystem configuration:**

  ```
  pm2 start ecosystem.config.js
  ```

**Useful pm2 commands:**

- **Stop all processes:**

  ```
  pm2 stop all
  ```

- **Delete all processes:**

  ```
  pm2 delete all
  ```

- **Check status of processes:**

  ```
  pm2 status
  ```

- **Monitor processes:**
  ```
  pm2 monit
  ```
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
4. npx prisma migrate reset

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

Networking (VPC)