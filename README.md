# Technical Task - Effective Mobile
## Рабочая среда
- Windows Powershell
- Node.js (v22.8.0) + pnpm

Ниже описано что нужно для работы под Linux.  
Прилагается Postman для тестирования API.

# Task 1
> Запускайте первый сервис, чтобы инцилизировать базу данных...

## Service 1
Stack: JS, Express.js + Axios  
URL: localhost:3000  

### Инициализация проекта
1. Перейдите в директорию:
```bash
   cd ./task1/service1
   ```
2. Установите зависимости и запустите проект:
   ```bash
   pnpm i
   pnpm start
   ```


## Service 2 
Stack: TS, Express.js  
URL: localhost:3001  

### Инициализация проекта
1. Перейдите в директорию:
```bash
   cd ./task1/service2
   ```
2. Установите зависимости и запустите проект:
   ```bash
   pnpm i
   pnpm start
   ```

Более подробно в Postman...

----------------------------

# Task 2
Service on Nestjs  
URL: localhost:3000  

### Инициализация проекта

1. Перейдите в директорию:
   ```bash
   cd ./task2
   ```

2. Установите зависимости и запустите проект:
   ```bash
   pnpm i
   pnpm start
   ```

### Заполнение данных

1. Запустите проект в первый раз:
   ```bash
   pnpm start
   ```

2. Выполните миграции при помощи :
   ```bash
   npm run migration:run
   npm start
   ```


### P.S.
В gitignore не добавлял .env файл  
NPM настроен под Windows. Если нужен Linux, необходимо сделать следующее:

Поменять в `package.json` строки migration на эти:
```
"migration:generate": "npm run typeorm -- -d ./src/config/typeorm.ts migration:generate ./src/migrations/$npm_config_name",
"migration:create": "npm run typeorm -- migration:create ./src/migrations/$npm_config_name",
"migration:revert": "npm run typeorm -- -d ./src/config/typeorm.ts migration:revert"
```

2024 (с) statebyte