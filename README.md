# marschat

## Dev
#### Shared Services
Ensure ports 3306 and 6379 are open, then run:
```bash
docker-compose -f infra/docker-compose-dev.yaml
```
This runs [mariadb:10.3-myrocks](https://quay.io/ahappypie/mariadb:10.3-myrocks) on 3306 and redis on 6379. 

#### Database Connection
You must set environment variables for services to connect to the database: 
```
MYSQL_HOST
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
```
And these variables for services to connect to redis:
```
REDIS_DELAY_HOST
REDIS_DELAY_PORT
```
These values are defined by options in the docker-compose-dev.yaml file.


#### GRPC Servers
You must set environment variables for the GRPC servers. Typically, I set the following variables:
```
GRPC_DELAY_URL=localhost:50051
GRPC_MESSAGE_URL=localhost:50061
```