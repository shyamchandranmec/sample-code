"use strict";

module.exports = {
    appPort: process.env.MB_APP_PORT || "3000",
    publisher: process.env.MB_PUBLISHER || "pubnub",
    db: {
        name: process.env.MB_DB_NAME,
        host: process.env.MB_DB_HOST,
        port: process.env.MB_DB_PORT,
        username: process.env.MB_DB_USERNAME,
        password: process.env.MB_DB_PASSWORD
    },
    pubnub_publishKey: process.env.MB_PUBNUB_PUB_KEY,
    pubnub_subscribeKey: process.env.MB_PUBNUB_SUB_KEY,
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        sqs: {
            queue: {
                entity: process.env.SQS_QUEUE_ENTITY,
                entityState: process.env.SQS_QUEUE_ENTITY_STATE
            }
        }
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
};