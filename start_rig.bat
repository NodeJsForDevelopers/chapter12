@echo off
START /B redis-server
START /B mongod --dbpath C:\data\mongodb
set MONGODB_URL=mongodb://localhost/hangman
set REDIS_URL=redis://127.0.0.1:6379/
SLEEP 2
set PORT=3000
START /B npm start
SLEEP 1
set PORT=3001
START /B npm start
