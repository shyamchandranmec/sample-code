"use strict";

let eventEmitter = require("events");

module.exports = app => {
    let logger = app.helpers.logger;

    let eventHandler = new eventEmitter.EventEmitter();
    const DB_CONNECTION_ESTABLISHED = "DB_CONNECTION_ESTABLISHED";

    let events = [
        DB_CONNECTION_ESTABLISHED
    ];

    events.forEach(function (event) {
        eventHandler.addListener(event, function () {
            logger.info("[Events] Event Emitted", event);
        });
    });

    return {
        eventHandler,
        DB_CONNECTION_ESTABLISHED
    };
};