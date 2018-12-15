# marschat

## Dev
#### Shared Services
Ensure ports 3306, 6379, 4222 and 8222 are open, then run:
```bash
docker-compose -f infra/docker-compose-dev.yaml
```
This runs [mariadb:10.3-myrocks](https://quay.io/ahappypie/mariadb:10.3-myrocks) on 3306, redis on 6379 and nats-streaming on 4222 and 8222 (monitoring)