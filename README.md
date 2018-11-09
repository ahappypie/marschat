# marschat

## Dev
#### Shared Services
Ensure ports 3306, 4222 and 8222 are open, then run:
```bash
docker-compose -f infra/docker-compose-dev.yaml
```
This runs mysql on 3306 and nats-streaming on 4222 and 8222 (monitoring)