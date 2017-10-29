"use strict";

module.exports = app => {
    let joi = require("joi");

    let stateSchema = joi.object().keys({
        id: joi.string(),
        stateName: joi.string(),
        possibleNextStates: joi.array().items(joi.string()),
        requiredProperties: joi.array().items(joi.string())
    });

    let createEntityTypeSchema = joi.object().keys({
        type: joi.string().required(),
        defaultState: joi.string().required(),
        states: joi.array().items(stateSchema).required()
    });
    let getEntityTypeSchema = joi.string().required();

    return {
        createEntityTypeSchema,
        getEntityTypeSchema
    };
};