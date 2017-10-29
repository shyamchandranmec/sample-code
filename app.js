"use strict";

require("newrelic");

let express = require("express");
let consign = require("consign");
let logger = require("winston");
let app = express();

consign()
    .include("./config")
    .then("./helpers/logger.js")
    .then("./helpers")
    .then("./exceptions")
    .then("./db/connection.js")
    .then("./redis/redis.js")
    .then("./redis")
    .then("./middlewares/basicSettings.js")
    .then("./validators/schemas")
    .then("./validators")
    .then("./middlewares/staticResources.js")
    .then("./models")
    .then("./services/publisherFactory/baseClass.js")
    .then("./services/publisherFactory/pubnub.js")
    .then("./services/publisherFactory/publisherFactory.js")
    .then("./services/entityTypesService.js")
    .then("./services/factory/baseEntity.js")
    .then("./services/factory/orderOnlineEntity.js")
    .then("./services/factory/orderOnlineTestEntity.js")
    .then("./services/factory/manualOrderEntity.js")
    .then("./services/factory/tableReservationEntity.js")
    .then("./services/factory/aggregatorOrderEntity.js")
    .then("./services/factory/entityFactory.js")
    .then("./services")
    .then("./queue")
    .then("./controllers")
    .then("./routes")
    .then("./middlewares/mainRoutes.js")
    .then("./middlewares/errorHandler.js")
    .into(app);

let appPort = app.config.envVariables.appPort || "3000";

if (process.env.NODE_ENV !== "test") {
    app.listen(appPort, () => {
        logger.info(`Server started on port ${appPort}`);
    });
}

module.exports = app;