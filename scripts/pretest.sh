#!/usr/local/env bash

docker volume rm `docker volume ls -q -f dangling=true`
docker stop mongo_test;
docker rm mongo_test;
docker run -d --name mongo_test -p 37017:27017 mongo --auth --storageEngine wiredTiger;
until [ `docker logs mongo_test | grep "waiting for connections on port" | wc -l` -eq 1 ]; do echo WAITING FOR DB && sleep 1; done;
docker exec mongo_test mongo --eval "db.createUser({ user: 'root', pwd: 'root', roles: [ { role: 'userAdminAnyDatabase', db: 'admin' } ] });" admin;
docker exec mongo_test mongo -u root -proot --authenticationDatabase admin --eval "db.createUser({ user: 'iftxt', pwd: 'iftxt', roles: [ { role: 'readWrite', db: 'test' } ] });" test
