"use strict";

let _ = require("underscore");
let moment = require("moment");
let joi = require("joi");

module.exports = app => {

    let logger = app.helpers.logger;
    let entityModel = app.models.entity;
    let appConfig = app.config.envVariables;
    let errorFormatter = app.helpers.errorFormatter;
    let entityTypesService = app.services.entityTypesService;
    let publisherFactory = app.services.publisherFactory.publisherFactory;

    class BaseEntity {
        constructor (entityModel) {
            this.currentState = entityModel.currentState;
            this.entityType = entityModel.entityType;
            this.entityModel = entityModel;
            this.entityId = entityModel.id;
            this.entityTypeModel = null;
            this.publisher = publisherFactory.getPublisher(appConfig.publisher, entityModel);
        }

        /**
         * gets entity type details --> validates state change --> changes the state
         * @returns {Promise}
         */
        updateState (state) {
            this.changeSource = state.changeSource;
            this.sourceCode = state.sourceCode;
            this.nextState = state.nextState;
            this.details = state.details || {};
            this.changedAt = moment().format();

            logger.info("Updating state - start");
            return new Promise((resolve, reject) => {
                this.checkValidity(this.nextState).then(() => {
                    return this.changeState();
                }).then((entity) => {
                    this.entityModel = entity;
                    this.publisher.updateEntity(entity);
                    return this.pushEntityState();
                }).then((updatedEntity) => {
                    return resolve(updatedEntity);
                }).catch((err) => reject(err));
            });
        }

        updateEntity (entityMeta) {
            logger.info(`[baseEntity] [updateEntity] updating entity meta - id, entityMeta - ${this.entityId}`, entityMeta);
            return new Promise((resolve, reject) => {
                entityModel.updateEntityMeta(this.entityId, entityMeta)
                    .then((updatedEntity) => {
                        logger.info(`[baseEntity] [updateEntity] Updated Model - id - ${this.entityId}`);
                        this.publisher.updateEntity(updatedEntity);
                        this.pushUpdatedEntity();
                        return resolve(updatedEntity);
                    })
                    .catch((err) => reject(err));
            });
        }

        pushCreatedEntity () {
            let entity = this.entityModel;
            if (!entity) {
                return;
            }
            logger.info(`[baseEntity] [pushCreatedEntity] Pushing Entity into TL - entityId - ${entity._id}`);

            return this.publisher.pushEntityOnCreate();
        }

        pushUpdatedEntity () {
            let entity = this.entityModel;
            if (!entity) {
                return;
            }
            logger.info(`[baseEntity] [pushUpdatedEntity] Pushing Entity into TL - entityId - ${entity._id}`);

            return this.publisher.pushEntityOnUpdate();
        }

        pushEntityState () {
            let entity = this.entityModel;
            if (!entity) {
                return;
            }
            logger.info(`[baseEntity] [pushEntityState] Pushing into TL - entityId - ${entity._id}`);

            return this.publisher.pushEntityState();
        }

        /**
         * fetches the entity type details for the given entity type
         * @returns {Promise}
         */
        getEntityTypeDetails () {
            return new Promise((resolve, reject) => {
                if (this.entityTypeModel) {
                    return resolve(this.entityTypeModel);
                }
                entityTypesService.getEntityTypeByType(this.entityType)
                    .then((entityType) => {
                        this.entityTypeModel = entityType;
                        return resolve(this.entityTypeModel);
                    }).catch((err) => {
                        return reject(err);
                    });
            });
        }

        /**
         * changes the state of entity
         * @returns {*}
         */
        changeState () {
            logger.info(`changing state of entity of id ${this.entityModel._id}`);
            return entityModel.changeState(this.entityModel._id, this);
        }

        /**
         * checks validity of next state
         * @returns {*}
         */
        checkValidity (nextState) {
            logger.info("Checking Validity - start");
            return this.getEntityTypeDetails()
                .then((entityType) => {
                    let state = _.findWhere(entityType.states, {stateName: this.currentState});
                    return this.validateForChangeState(state.possibleNextStates, nextState);
                });
        }

        /**
         * validates the state change
         * @param states
         * @param nextState
         * @returns {Promise}
         * */
        validateForChangeState (states, nextState) {
            return new Promise((resolve, reject) => {
                logger.info("Validating entity");

                if (!states) {
                    let errorObject = errorFormatter.createErrorObject({
                        status: 404,
                        message: "State Array for current state not found",
                        details: "Invalid State"
                    });
                    return reject(errorObject);
                } else if (states.indexOf(nextState) !== -1) {
                    logger.info(`Validation successful for entity id  nextState : ${this.entityModel._id}  ${nextState}`);
                    return resolve();
                } else {
                    logger.info(`Validation for state change failed for id  ${this.entityModel._id}`);
                    let errorObject = errorFormatter.createErrorObject({
                        status: 400,
                        message: "State Transition validation failed",
                        details: "State Transition failed"
                    });
                    return reject(errorObject);
                }
            });
        }

        /**
         * Validate EntityMeta Schema (Joi Rule(s))
         *
         * @returns {Promise}
         */
        getEntityMetaValidationSchema () {
            return joi.object().required();
        }
    }

    return BaseEntity;
};
