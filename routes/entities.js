"use strict";
module.exports = app => {
    let router = require("express").Router();
    let entitiesController = app.controllers.entitiesController;

    router.route("/")
        .post((req, res, next) => entitiesController.registerEntity(req, res, next))
        .get((req, res, next) => entitiesController.getEntities(req, res, next));

    router.route("/:id")
        .get((req, res, next) => entitiesController.getEntity(req, res, next))
        .put((req, res, next) => entitiesController.updateEntityState(req, res, next))
        .patch((req, res, next) => entitiesController.updateEntityMeta(req, res, next));

    router.route("/:id/validate/:nextState")
        .get((req, res, next) => entitiesController.checkValidity(req, res, next));

    return router;
};