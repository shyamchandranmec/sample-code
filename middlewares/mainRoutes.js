"use strict";

module.exports = app => {
    app.use("/entityTypes", app.routes.entityTypes);
    app.use("/entities", app.routes.entities);
};