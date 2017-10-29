"use strict";

var rp = require("request-promise");

module.exports = app => {
    let entityModel = app.models.entity;
    let logger = app.helpers.logger;
    let errorFormatter = app.helpers.errorFormatter;
    let validator = app.validators.entitiesValidator;
    let entityFactory = app.services.factory.entityFactory;
    let entityTypesService = app.services.entityTypesService;

    function registerEntity (entity) {
        return new Promise((resolve, reject) => {
            entityModel.createEntity(entity)
                .then((entityModel) => {
                    logger.info("[entitiesService] [registerEntity] Entity Created - entity - ", entityModel);
                    let entity = entityFactory.getEntity(entityModel);
                    if (!entity) {
                        throw new Error("Entity Type not found");
                    } else {
                        return entity.pushCreatedEntity();
                    }
                })
                .then((entity) => resolve(entity))
                .catch((err) => {
                    logger.error("[registerEntity] Error Occurred - Entity -", entity);
                    logger.error(err);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "Unable to register entity",
                        details: err.message
                    });

                    return reject(errorObject);
                });
        });
    }

    function updateEntityState (id, state) {
        return new Promise((resolve, reject) => {
            logger.info("[entitiesService] [updateEntityState] - entityId, state - ", id, state);
            entityModel.getEntity(id)
                .then(entityModel => {
                    logger.info("[entitiesService] [updateEntityState] Entity Found - entityId, entityType - ", id, entityModel.entityType);
                    let entity = entityFactory.getEntity(entityModel);
                    if (!entity) {
                        throw new Error("Entity Type not found");
                    } else {
                        return entity.updateState(state);
                    }
                }).then(updatedEntity => {
                    return resolve(updatedEntity);
                }).catch(err => {
                    if (!(err instanceof Error)) {
                        return reject(err);
                    }

                    logger.error("[entitiesService] [updateEntityState] Error Occurred - entityId, state -", id, state);
                    logger.error(err);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "Unable to update entity",
                        details: err.message
                    });
                    return reject(errorObject);
                });
        });
    }

    function updateEntityMeta (id, entityMeta) {
        logger.info("[entitiesService] [updateEntityMeta] - id, entityMeta -", id, entityMeta);
        return new Promise((resolve, reject) => {
            entityModel.getEntity(id)
                .then(entityModel => {
                    logger.info("[entitiesService] [updateEntityMeta] Updated in DB - id, entityMeta -", id, entityMeta);
                    let entity = entityFactory.getEntity(entityModel);
                    if (!entity) {
                        throw new Error("Entity Type not found");
                    } else {
                        return entity.updateEntity(entityMeta);
                    }
                })
                .then(updatedEntity => {
                    return resolve(updatedEntity);
                })
                .catch(err => {
                    if (!(err instanceof Error)) {
                        return reject(err);
                    }

                    logger.error("[entitiesService] [updateEntityMeta] Error Occurred - entityId, state -", id, entityMeta);
                    logger.error(err);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "Unable to update entity",
                        details: err.message
                    });
                    return reject(errorObject);
                });
        });
    }

    function checkValidity (stateData) {
        return new Promise((resolve, reject) => {
            logger.info("[entitiesService] [checkValidity] Validation check - ", stateData);
            entityModel.getEntity(stateData.id)
                .then(entityModel => {
                    logger.info("[entitiesService] [checkValidity] Entity Found - entityId, entityType -", stateData.id, entityModel.entityType);
                    let entity = entityFactory.getEntity(entityModel);
                    if (!entity) {
                        throw new Error("Entity Type not found");
                    } else {
                        return entity.checkValidity(stateData.nextState);
                    }
                }).then(() => {
                    let success = {
                        status: 200,
                        message: "Valid State Change",
                        details: `Can change state to ${stateData.nextState}`
                    };
                    logger.info("[entitiesService] [checkValidity] Valid Next State -", stateData);
                    return resolve(success);
                }).catch(err => {
                    if (!(err instanceof Error)) {
                        return reject(err);
                    }

                    logger.error("[entitiesService] [checkValidity] Error Occurred -", stateData);
                    logger.error(err);
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "Unable to check validity for state change",
                        details: err.message
                    });
                    return reject(errorObject);
                });
        });
    }

    function validateEntityType (entity) {
        return new Promise((resolve, reject) => {
            logger.info(`[entitiesService] [validateEntityType] Validating entityType - ${entity.entityType}`);
            entityTypesService.getEntityTypeByType(entity.entityType)
                .then((entityType) => {
                    logger.info(`[entitiesService] [validateEntityType] Valid entityType - ${entity.entityType}`);
                    return resolve(entity);
                })
                .catch((err) => {
                    logger.error(`[entitiesService] [validateEntityType] Invalid entityType - ${entity.entityType}`);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 400,
                        message: "Invalid entityType",
                        details: err.message
                    });

                    return reject(errorObject);
                });
        });
    }

    function getEntity (id) {
        return entityModel.getEntity(id);
    }

    function getEntities (query) {
        return new Promise((resolve, reject) => {
            logger.info("[entitiesService] [getEntites] query -", query);
            let condition = {};
            let count = query.count || 100;
            let offset = query.offset || 0;

            if (query.locationIds) {
                condition.locationId = {
                    $in: query.locationIds.split(",")
                };
            }

            if (query.cloudSiteId) {
                condition.cloudSiteId = {
                    $eq: query.cloudSiteId
                };
            }

            if (query.entityType) {
                condition.entityType = {
                    $in: query.entityType.split(",")
                };
            }

            entityModel.getEntities(condition, count, offset)
                .then((entities) => {
                    logger.info(`[entitiesService] [getEntities] ${entities.length} Entities returned - query -`, query);

                    let response = {
                        success: true,
                        count: entities.length,
                        entities: entities
                    };

                    return resolve(response);
                })
                .catch((err) => {
                    logger.error("[entitiesService] [getEntities] Error Occurred - query -", query);
                    logger.info(err);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 400,
                        message: "Unable to get entities",
                        details: err.message
                    });

                    return reject(errorObject);
                });
        });
    }

    /**
     * Inform EntityType about error in entity
     *
     * @param entity    Object
     * @param error     Object
     * @returns {Promise}
     */
    function informEntityTypeAboutError (entity, error) {
        return new Promise((resolve, reject) => {
            logger.info("[entitiesService] [informEntityTypeAboutError] error, entity", entity, error);

            error.entity = entity;

            getEntityUrl(entity)
                .then(url => {
                    let options = {
                        method: "POST",
                        uri: url,
                        body: error,
                        json: true
                    };

                    rp(options)
                        .then(response => {
                            logger.info("[entitiesService] [informEntityTypeAboutError] Successfully informed entityType - response -", response);
                            resolve(response);
                        })
                        .catch(err => {
                            if (!(err instanceof Error)) {
                                return reject(err);
                            }

                            let errorObject = errorFormatter.createErrorObject({
                                status: 400,
                                message: "Unable to inform entityType about error",
                                details: err.message
                            });

                            return reject(errorObject);
                        });
                })
                .catch(err => reject(err));
        });
    }

    function getEntityUrl (entity) {
        return new Promise((resolve, reject) => {
            if (entity.url) {
                resolve(entity.url);
            } else {
                entityTypesService.getEntityTypeByType(entity.entityType)
                    .then(entityType => {
                        if (entityType.url) {
                            return resolve(entityType.url);
                        } else {
                            let errorObject = errorFormatter.createErrorObject({
                                status: 400,
                                message: "No entityType URL found",
                                details: "Can't find URL in entity or entityType"
                            });

                            return reject(errorObject);
                        }
                    })
                    .catch(err => reject(err));
            }
        });
    }

    function validateEntityMeta (entity) {
        let entityObj = entityFactory.getEntity(entity);
        let entityMetaSchema = entityObj.getEntityMetaValidationSchema();

        return validator.validateEntityMeta(entity, entityMetaSchema);
    }

    return {
        registerEntity,
        updateEntityState,
        getEntity,
        getEntities,
        checkValidity,
        updateEntityMeta,
        validateEntityType,
        informEntityTypeAboutError,
        validateEntityMeta
    };
};