"use strict";

let mongoose = require("mongoose");

module.exports = app => {
    let logger = app.helpers.logger;
    let errorFormatter = app.helpers.errorFormatter;

    let stateSchema = mongoose.Schema({
        id: String,
        stateName: String,
        possibleNextStates: [String],
        requiredProperties: [String]
    });

    let entityTypeSchema = mongoose.Schema({
        type: String,
        defaultState: String,
        states: [stateSchema],
        url: String
    }, {
        timestamps: true,
        collection: "entityTypes",
        minimize: false
    });

    let EntityTypeModel = mongoose.model("entityType", entityTypeSchema);

    entityTypeSchema.set("toJSON", {
        virtuals: true
    });

    EntityTypeModel.getEntityType = (id) => {
        return new Promise((resolve, reject) => {
            logger.info(`finding the entityType with id : ${id}`);
            EntityTypeModel.findOne({_id: id}).then(entityType => {
                if (entityType) {
                    logger.info(`found entityType with id: ${id}`);
                    return resolve(entityType.toJSON());
                } else {
                    logger.info(`could not find entityType with id: ${id}`);
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: `entityType not found with id ${id}`,
                        details: ""
                    });

                    return reject(errorObject);
                }
            }).catch(err => {
                logger.error(`unable to find entityType with id ${id}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Some error occurred",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityTypeModel.createEntityType = details => {
        return new Promise((resolve, reject) => {
            logger.info("Creating entityType");
            EntityTypeModel.findOne({"type": details.type}).then((entity) => {
                if (entity) {
                    logger.error(`entityType ${details.type} already exists`);
                    let errorObject = errorFormatter.createErrorObject({
                        status: 400,
                        message: `entityType ${details.type} already exists`,
                        details: ""
                    });
                    return reject(errorObject);
                } else {
                    let entityType = new EntityTypeModel(details);
                    return entityType.save(details);
                }
            }).then(entityType => {
                logger.info("Successfully saved entityType", entityType.toJSON());
                return resolve(entityType.toJSON());
            }).catch(err => {
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to create entityType",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityTypeModel.updateEntity = (type, updatedEntity) => {
        return new Promise((resolve, reject) => {
            logger.info(`updating entityType with type ${type}`);
            EntityTypeModel.findOneAndUpdate({type: type}, updatedEntity, {new: true}).then((entityType) => {
                if (!entityType) {
                    logger.info(`could not find entityType with type ${type}`);
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: `could not find entityType with type ${type}`,
                        details: ""
                    });

                    return reject(errorObject);
                }
                logger.info(`Successfully updated entityType with type ${type}`);
                let result = entityType.toJSON();
                return resolve(result);
            }).catch(err => {
                logger.error(`Unable to update entityType with type ${type}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to update entityType with given type",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityTypeModel.removeEntityTypeWithType = type => {
        return new Promise((resolve, reject) => {
            logger.info(`Removing entityType with type ${type}`);
            EntityTypeModel.findOneAndRemove({type: type}).then((entityType) => {
                logger.info(`Successfully deleted entityType with type ${type}`);
                let result = {};
                if (entityType) {
                    result = entityType.toJSON();
                }

                return resolve(result);
            }).catch(err => {
                logger.error(`Unable to remove entityType with type ${type}`);
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to remove entityType with given type",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    EntityTypeModel.getEntityTypeByType = (type) => {
        return new Promise((resolve, reject) => {
            logger.info(`Fetching EntityType with type ${type}`);
            EntityTypeModel.findOne({"type": type}).then(entityType => {

                if (entityType) {
                    logger.info(`Found entityType with type: ${type}`);
                    return resolve(entityType.toJSON());
                } else {
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: `Unable to find entityType with type ${type}`,
                        details: ""
                    });
                    return reject(errorObject);
                }

            }).catch(err => {
                logger.error(err);
                let errorObject = errorFormatter.createErrorObject({
                    status: 404,
                    message: "Unable to find entityType",
                    details: err.message
                });
                return reject(errorObject);
            });
        });
    };

    return EntityTypeModel;
};