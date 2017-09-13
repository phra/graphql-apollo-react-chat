#!/usr/local/env bash

docker run -d --name mongo -p 27017:27017 mongo --auth --storageEngine wiredTiger;
until [ `docker logs mongo | grep "waiting for connections on port" | wc -l` -eq 1 ]; do echo WAITING FOR DB && sleep 1; done;
docker exec mongo mongo --eval "db.createUser({ user: 'root', pwd: 'root', roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ] });" admin;
docker exec mongo mongo -u root -proot --authenticationDatabase admin --eval "db.createUser({ user: 'iftxt', pwd: 'iftxt', roles: [ { role: 'readWrite', db: 'zoover' }, { role: 'readWrite', db: 'stage' }, { role: 'readWrite', db: 'development' } ] });" zoover
