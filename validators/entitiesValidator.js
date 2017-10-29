"use strict";

module.exports = app => {
    let joi = require("joi");
    let errorFormatter = app.helpers.errorFormatter;
    let schemas = app.validators.schemas.entitiesSchema;
    let logger = app.helpers.logger;

    let joiValidationOption = {
        abortEarly: false,
        allowUnknown: true
    };

    function validateCreateEntity (entity) {
        logger.info(`Validating createEntity: externalId ${entity.externalId}`);

        return new Promise((resolve, reject) => {
            joi.validate(entity, schemas.createEntitySchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    logger.info("createEntity validation successful");
                    return resolve(entity);
                }
            });
        });
    }

    function validateUpdateEntityState (entity) {
        logger.info("Validating updateEntityState");

        return new Promise((resolve, reject) => {
            joi.validate(entity, schemas.updateEntityStateSchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    logger.info("updateEntity validation successful");
                    return resolve(entity);
                }
            });
        });
    }

    function validateUpdateEntityMeta (entity) {
        logger.info("Validate updateEntity");

        return new Promise((resolve, reject) => {
            joi.validate(entity, schemas.updateEntityMetaSchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error("[validateUpdateEntity] Validation Failed - error -", error.details);
                    return reject(error);
                } else {
                    logger.info("[validateUpdateEntity] Validation Success");
                    return resolve(entity);
                }
            });
        });
    }

    function validateGetEntity (id) {
        logger.info("Validate getEntity");
        return new Promise((resolve, reject) => {
            joi.validate(id, schemas.getEntitySchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    logger.info("getEntity validation successful");
                    return resolve(id);
                }
            });
        });
    }

    function validateGetEntities (params) {
        logger.info("Validate getEntities");

        return new Promise((resolve, reject) => {
            joi.validate(params, schemas.getEntitiesSchema, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error("Validation failed", err.details);
                    return reject(error);
                } else {
                    logger.info("getEntities validation successful");
                    return resolve(params);
                }
            });
        });
    }

    function validateCheckValidity (entity) {
        return new Promise((resolve, reject) => {
            joi.validate(entity, schemas.checkValiditySchema, joiValidationOption, err => {
                if (err) {
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err);
                    logger.error(`Validation failed : ${JSON.stringify(error.details)}`);
                    return reject(error);
                } else {
                    logger.info("checkValidity validation successful");
                    return resolve(entity);
                }
            });
        });
    }

    /**
     * Validate entityMeta with specified validationSchema
     *
     * @param entity    Entity Object
     * @param validationSchema  Joi Schema for validation
     * @returns {Promise}
     */
    function validateEntityMeta (entity, validationSchema) {
        return new Promise((resolve, reject) => {
            joi.validate(entity.entityMeta, validationSchema, joiValidationOption, err => {
                if (err) {
                    logger.error("[entitiesValidator] [validateEntityMeta] Error in EntityMeta - entityMeta -", entity.entityMeta);
                    let error = errorFormatter.createErrorObjectFromJoiErrors(err, "entityMeta");
                    return reject(error);
                } else {
                    logger.info("[entitiesValidator] [validateEntityMeta] EntityMeta Validated Successful - entityMeta -", entity.entityMeta);
                    return resolve(entity);
                }
            });
        });
    }

    return {
        validateCreateEntity,
        validateUpdateEntityState,
        validateUpdateEntityMeta,
        validateGetEntity,
        validateGetEntities,
        validateCheckValidity,
        validateEntityMeta
    };
};