"use strict";

let mongoose = require("mongoose");

module.exports = app => {
    let logger = app.helpers.logger;
    let errorFormatter = app.helpers.errorFormatter;
    let entitySchema = mongoose.Schema({
        entityType: String,
        externalId: String,
        cloudSiteId: String,
        locationId: String,
        config: {},
        currentState: String,
        currentStateDetails: {},
        services: {type: Object, default: {}},
        stateHistory: [{}],
        entityMeta: {}
    }, {
        timestamps: true,
        collection: "entities",
        minimize: false
    });

    let EntityModel = mongoose.model("entity", entitySchema);

    entitySchema.set("toJSON", {
        virtuals: true
    });

    EntityModel.getEntity = (id) => {
        return new Promise((resolve, reject) => {

            logger.info(`Finding entity with id ${id}`);
            EntityModel.findById(id).then(entity => {
                if (!entity) {
                    throw new Error("No result for this entity found");
                } else {
                    logger.info(`Found entity with id ${id}`);
                    return resolve(entity.toJSON());
                }
            }).catch(err => {
                logger.error(`Unable to find entity with id ${id}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to find entity with given id",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityModel.getEntities = (condition, count, offset) => {
        logger.info("[entitiyModel] [getEntities] - count, offset, condition - ", count, offset, condition);
        return EntityModel.find(condition, null, {limit: count, skip: offset, sort: {_id: -1}});
    };

    EntityModel.changeState = (id, data) => {
        return new Promise((resolve, reject) => {
            logger.info(`Updating entity with id ${id}`);

            let obj = {
                source: data.changeSource,
                sourceId: data.sourceCode,
                changedFrom: data.currentState,
                changedTo: data.nextState,
                changedAt: data.changedAt,
                details: data.details
            };

            EntityModel.findByIdAndUpdate(id, {
                $push: {stateHistory: obj},
                $set: {currentState: data.nextState, currentStateDetails: obj}
            }, {safe: true, upsert: true, new: true}).then((entity) => {
                if (entity) {
                    return resolve(entity.toJSON());
                } else {
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: `Unable to update entity with given id: ${id}`,
                        details: "Unable to find entity"
                    });
                    return reject(errorObject);
                }
            }).catch(err => {
                logger.info(`Error occurred in updating Entity with id ${id} : ${err}`);

                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: `Unable to update entity with given id: ${id}`,
                    details: err.message
                });

                return reject(errorObject);
            });
        });
    };

    EntityModel.createEntity = entityData => {

        logger.info("Adding initial history to entity");
        let obj = {
            source: entityData.entityType,
            sourceId: entityData.entityType,
            changedFrom: null,
            changedTo: entityData.currentState,
            changedAt: new Date(),
            details: entityData.details || {}
        };
        entityData.stateHistory = [obj];
        entityData.currentStateDetails = obj;

        return new Promise((resolve, reject) => {
            logger.info("Creating entity");
            let entity = new EntityModel(entityData);
            entity.save(entityData).then(entity => {
                logger.info("Successfully saved entity");
                return resolve(entity.toJSON());
            }).catch(err => {
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to create entity",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityModel.removeEntityWithId = id => {
        return new Promise((resolve, reject) => {
            logger.info(`Removing entity with id ${id}`);
            EntityModel.findOneAndRemove({_id: id}).then((entity) => {
                logger.info(`Successfully deleted entity with id ${id}`);
                let result = {};
                if (entity) {
                    result = entity.toJSON();
                }

                return resolve(result);
            }).catch(err => {
                logger.error(`Unable to remove entity with id ${id}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to remove entity with given id",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityModel.removeEntityWithExternalId = externalId => {
        return new Promise((resolve, reject) => {
            logger.info(`Removing entity with externalId ${externalId}`);
            EntityModel.findOneAndRemove({externalId: externalId}).then((entity) => {
                logger.info(`Successfully deleted entity with externalId ${externalId}`);
                let result = {};
                if (entity) {
                    result = entity.toJSON();
                } else {
                    return resolve(result);
                }
            }).catch(err => {
                logger.error(`Unable to remove entity with externalId ${externalId}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to remove entity with given externalId",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityModel.updateEntityMeta = (id, entityMeta) => {
        return new Promise((resolve, reject) => {
            logger.info(`[entityModel] [updateEntityMeta] updating entity meta - id, entityMeta - ${id},`, entityMeta);
            EntityModel.findOneAndUpdate({_id: id}, {$set: {entityMeta: entityMeta}}, {new: true})
                .then((updatedEntity) => {
                    if (updatedEntity) {
                        logger.info(`[entityModel] [updateEntityMeta] Successfully updated entityId - id - ${id}`);
                        return resolve(updatedEntity.toJSON());
                    } else {
                        logger.info(`[entityModel] [updateEntityMeta] entityId not found - id - ${id}`);

                        let errorObject = errorFormatter.createErrorObject({
                            status: 404,
                            message: `entityId not found: ${id}`,
                            details: "Unable to find entity"
                        });

                        return reject(errorObject);
                    }
                })
                .catch(err => {
                    logger.info(`[entityModel] [updateEntityMeta] Error occurred - id, err - ${id},`, err);

                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: `Unable to update entity with given id: ${id}`,
                        details: err.message
                    });

                    return reject(errorObject);
                });
        });
    };

    return EntityModel;
};
