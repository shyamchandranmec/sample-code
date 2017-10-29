"use strict";

let redis = require("redis");

module.exports = app => {
    let redisConfig = app.config.envVariables.redis;
    let logger = app.helpers.logger;

    logger.info(`[redis] Creating Client - host, port - ${redisConfig.host}, ${redisConfig.port}`);

    let client = redis.createClient({
        host: redisConfig.host,
        port: redisConfig.port,
        retry_strategy: function (options) {
            if (options.error.code === "ECONNREFUSED") {
                // End reconnecting on a specific error and flush all commands with a individual error
                logger.error("[redis] [createClient] The server refused the connection");
                return new Error("The server refused the connection");
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                logger.error("[redis] [createClient] Retry time exhausted");
                return new Error("Retry time exhausted");
            }
            if (options.times_connected > 10) {
                // End reconnecting with built in error
                logger.error("[redis] [createClient] Retried too many times");
                return undefined;
            }
            // reconnect after
            return Math.max(options.attempt * 100, 3000);
        }
    });

    let events = ["connect", "ready", "error", "end", "warning", "reconnecting"];

    events.forEach(function (event) {
        client.on(event, function () {
            logger.info(`[Redis] Event - ${event}`);
        });
    });

    return client;
};