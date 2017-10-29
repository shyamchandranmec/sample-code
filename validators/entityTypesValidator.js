"use strict";

module.exports = app => {
    let joi = require("joi");
    let errorFormatter = app.helpers.errorFormatter;
    let schemas = app.validators.schemas.entityTypesSchema;
    let logger = app.helpers.logger;

    function validateCreateEntityType (entityType) {
        logger.info(`Validating CreateEntityType request: entityType ${entityType.type}`);
        let joiValidationOption = {
            abortEarly: false,
            allowUnknown: true
        };

        return new Promise((resolve, reject) => {
            joi.validate(entityType, schemas.createEntityTypeSchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    logger.info("Validation successful for createEntityType");
                    return resolve(entityType);
                }
            });
        });
    }

    function validateGetEntityType (id) {
        let joiValidationOption = {
            abortEarly: false,
            allowUnknown: true
        };

        return new Promise((resolve, reject) => {
            joi.validate(id, schemas.getEntityTypeSchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    return resolve(id);
                }
            });
        });
    }

    return {
        validateCreateEntityType,
        validateGetEntityType
    };
};