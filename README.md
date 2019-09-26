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

#### Dependencies
Ensure yarn and sbt are available in your shell.
Then run the following commands to install dependencies:
```bash
cd api
npm install
cd ../delay/message
npm install
cd ../expire
npm install
```
Then compile the SBT project:
```bash
cd ../compute
sbt compile
```

#### Running Services
Each yarn service has a specific dev command:

/api: ```npm run dev```

/delay/message: ```npm run dev:message-service```

/delay/expire: ```npm run dev:expire-service```

For SBT:

/delay/compute: ```sbt run```

#### Endpoints
There are two endpoints available:

```GET localhost:3000/delay``` requires query parameter ```ts```, the unix timestamp (in milliseconds) you would like to know the light delay for. 
Returns light delay in milliseconds. 
Optionally add query parameter ```dest```, one of ```MARS | JUPITER | SATURN```, and the delay will be for the specified destination. Defaults to ```MARS``` if none is given.

```POST localhost:3000/message``` IN PROGRESS. Will accept body with ```message_id```, ```timestamp``` and ```callback_url```. 
Immediately returns light delay in milliseconds.
After the delay for ```timestamp```, a ```POST``` request will be made to ```callback_url``` indicating ```message_id``` has expired. 