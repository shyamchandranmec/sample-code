"use strict";

module.exports = app => {
    let router = require("express").Router();
    let entityTypesController = app.controllers.entityTypesController;

    router.route("/").post((req, res, next) => {
        return entityTypesController.createEntityType(req, res, next);
    });

    router.route("/:id").get((req, res, next) => {
        return entityTypesController.getEntityType(req, res, next);
    });

    return router;
};