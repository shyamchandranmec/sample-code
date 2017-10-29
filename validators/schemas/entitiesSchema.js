"use strict";

module.exports = app => {
    let joi = require("joi");

    let createEntitySchema = joi.object().keys({
        entityType: joi.string().required(),
        externalId: joi.string().required(),
        cloudSiteId: joi.string().required(),
        locationId: joi.string().required(),
        config: joi.object(),
        currentState: joi.string().required(),
        services: joi.array().items(joi.object()),
        entityMeta: joi.object().required()
    });

    let checkValiditySchema = joi.object().keys({
        id: joi.string().required(),
        nextState: joi.string().required()
    });

    let updateEntityStateSchema = joi.object().keys({
        changeSource: joi.string().required(),
        sourceCode: joi.string().required(),
        nextState: joi.string().required(),
        details: joi.object()
    });

    let updateEntityMetaSchema = joi.object().keys({
        entityMeta: joi.object().required()
    });

    let getEntitySchema = joi.string().required();

    let getEntitiesSchema = joi.object().keys({
        entityType: joi.string().min(1).max(30),
        locationIds: joi.string().min(1).max(100),
        cloudSiteId: joi.string().min(1).max(30),
        count: joi.number().integer().min(1).max(100),
        offset: joi.number().integer().max(1000000)
    });

    return {
        createEntitySchema,
        updateEntityStateSchema,
        updateEntityMetaSchema,
        getEntitySchema,
        getEntitiesSchema,
        checkValiditySchema
    };
};

