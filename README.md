# kafka-app

A small hands-on **Apache Kafka + Node.js/TypeScript** learning project built with
[KafkaJS](https://kafka.js.org/). It models a "rider location updates" scenario:
an admin creates a topic, a producer reads rider updates from stdin and publishes
them to partitions by region, and a consumer (joined to a consumer group) prints
messages as they arrive.

This is a demo / practice project, not a production service.

## Stack

- Node.js + TypeScript (compiled with `tsc` to CommonJS)
- [`kafkajs`](https://www.npmjs.com/package/kafkajs) client
- Package manager: **Yarn** (`yarn.lock` present) for the root project

## Layout

```
.
├── client.ts       # Shared Kafka client (broker connection config)
├── admin.ts        # Creates the `rider-updates` topic (2 partitions)
├── producer.ts     # Reads "<riderName> <location>" lines from stdin and publishes
├── consumer.ts     # Subscribes to `rider-updates`, prints messages for a group
├── tsconfig.json   # Compiles *.ts at the root into ./dist
├── Docker          # Shell notes for running Kafka + Zookeeper in Docker
└── kafka/          # A separate, self-contained scratch project (see below)
```

### The `kafka/` subfolder

`kafka/` is an independent second mini-project (its own `package.json`, uses npm)
with simpler quickstart demos (`quickstart-events`, `payment-done` topics) pointing
at `localhost:9092`. It is not imported by the root project and can be built/run on
its own (`cd kafka && npm install && npm run start | produce | consume`).

## Prerequisites: a running Kafka broker

The apps need a reachable Kafka broker. This repo does **not** ship a
`docker-compose.yml`; the `Docker` file contains the raw commands used to start
Zookeeper and a Confluent Kafka broker:

```bash
docker run -p 2181:2181 zookeeper

docker run -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka
```

Replace `<PRIVATE_IP>` with your host's IP. You must set the **same broker
address** in `client.ts`:

```ts
export const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['<PRIVATE_IP>:9092'], // e.g. '192.168.1.10:9092' or 'localhost:9092'
});
```

## Run (root project)

```bash
yarn install
yarn build          # tsc -> ./dist

# 1) create the topic (broker must be up)
yarn admin

# 2) start one or more consumers, each with a group id
node dist/consumer.js group-1

# 3) start the producer and type lines like: "tom north" / "sara south"
yarn producer
```

Producer input format is `"<riderName> <location>"`. `location` of `north` routes
to partition 0, anything else to partition 1.

## Status / what's incomplete

- **Builds and runs.** Both the root project and `kafka/` compile cleanly with
  `tsc` and start up; the only thing stopping a full run is the absence of a live
  Kafka broker (connection is refused / retried on `9092` when none is running).
- **Broker address is a placeholder.** `client.ts` and the `Docker` file use
  `<PRIVATE_IP>` — you must fill in a real address before anything connects.
- **No error handling** around broker connectivity: with no broker, KafkaJS retries
  indefinitely rather than exiting.
- **No tests**, no CI, no `docker-compose.yml` (only raw docker commands in `Docker`).
- **Two overlapping projects** (root + `kafka/`) that were clearly used for
  experimentation; they duplicate KafkaJS setup and are not integrated.
- **Config not externalized** — broker/topic/partition values are hardcoded; there
  is no environment-variable loading.
