"use strict";

module.exports = app => {
    let entityTypeModel = app.models.entityType;
    let redisEntityTypeModel = app.redis.rEntityType;
    let logger = app.helpers.logger;
    let utils = app.helpers.utils;

    function createEntityType (entityType) {
        return new Promise((resolve, reject) => {
            logger.info("[entityTypesService] [createEntityType] Creating a New EntityType -", entityType);
            entityTypeModel.createEntityType(entityType)
                .then((entity) => {
                    logger.info("[entityTypesService] [createEntityType] Created EntityType -", entityType);
                    redisEntityTypeModel.updateEntityType(entity.type, entity);

                    return resolve(entity);
                })
                .catch((err) => {
                    logger.error("[entityTypesService] [createEntityType] Some Error Occurred -", entityType);

                    return reject(err);
                });
        });
    }

    function getEntityType (id) {
        return entityTypeModel.getEntityType(id);
    }

    function getEntityTypeByType (type) {
        let cacheMethod = redisEntityTypeModel.getEntityType.bind(this, type);
        let persistenceMethod = entityTypeModel.getEntityTypeByType.bind(this, type);
        let updateMethod = redisEntityTypeModel.updateEntityType.bind(this, type);

        return utils.fetchFromCacheOrPersistenceStorage(cacheMethod, persistenceMethod, updateMethod);
    }

    return {
        createEntityType,
        getEntityType,
        getEntityTypeByType
    };
};
