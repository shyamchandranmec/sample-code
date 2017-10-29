"use strict";

let mongoose = require("mongoose");


module.exports = app => {
    let db = app.config.envVariables.db;
    let logger = app.helpers.logger;
    let eventHandler = app.helpers.events.eventHandler;
    let dbConnectEvent = app.helpers.events.DB_CONNECTION_ESTABLISHED;

    let dbURI;
    mongoose.Promise = Promise;

    function getAuthPart () {
        let urlPart = "";
        if (db.username && db.password) {
            urlPart = `${db.username}:${db.password}@`;
        }
        return urlPart;
    }

    dbURI = `mongodb://${getAuthPart()}${db.host}:${db.port}/${db.name}`;

    function onConnectionError (err) {
        logger.log("error", `Mongoose  connection error: ${err}`);
        logger.log("error", dbURI);
    }

    function onConnect () {
        logger.info(`Mongoose connection open to ${dbURI}`);
        eventHandler.emit(dbConnectEvent);
    }

    function onDisconnect () {
        logger.log("warn", "Mongoose connection disconnected");
    }

    function registerEvents () {
        mongoose.connection.on("connected", onConnect);

        /**
         *   If the connection throws an error
          */
        mongoose.connection.on("error", onConnectionError);

        /**
         * When the connection is disconnected
         */
        mongoose.connection.on("disconnected", onDisconnect);

        /**
         * If the Node process ends, close the Mongoose connection
          */
        process.on("SIGINT", function () {
            mongoose.connection.close(() => {
                logger.log("warn", "Mongoose connection disconnected through app termination");
                process.exit(0);
            });
        });
    }

    function connect () {
        registerEvents();
        mongoose.connect(dbURI);
    }
    connect();
};
