"use strict";

module.exports = app => {
    let logger = app.helpers.logger;
    let entityQueue = app.config.envVariables.aws.sqs.queue.entity;
    let entityStateQueue = app.config.envVariables.aws.sqs.queue.entityState;
    let sqsHelper = app.helpers.sqsHelper;
    let validator = app.validators.entitiesValidator;
    let errorFormatter = app.helpers.errorFormatter;
    let entitiesService = app.services.entitiesService;
    let eventHandler = app.helpers.events.eventHandler;
    let dbConnectEvent = app.helpers.events.DB_CONNECTION_ESTABLISHED;

    let receiveEntity = function () {
        sqsHelper.receive(entityQueue)
            .then((messagePayload) => {
                receiveEntity();
                if (messagePayload.Messages === undefined) {
                    logger.info("[entityConsumer] [receiveEntity] No message received");
                } else {
                    logger.info("[entityConsumer] [receiveEntity] Message Received", messagePayload.Messages[0]);

                    let message = messagePayload.Messages[0];
                    let entity = JSON.parse(message.Body);
                    let deleteHandle = message.ReceiptHandle;

                    return validator.validateCreateEntity(entity)
                        .then((entity) => entitiesService.validateEntityType(entity))
                        .then((entity) => entitiesService.registerEntity(entity))
                        .then((entity) => {
                            logger.info("[entityConsumer] [receiveEntity] Deleting message from Queue", message.Body);
                            return sqsHelper.del(entityQueue, deleteHandle);
                        })
                        .catch(err => {
                            logger.error("[entityConsumer] [receiveEntity] Error Occurred while creating entity", entity);
                            logger.error(err);

                            // Delete Message from Queue
                            sqsHelper.del(entityQueue, deleteHandle);

                            // Now, inform Entity Type about error (if possible)
                            let errorObject;

                            if (err instanceof Error) {
                                errorObject = errorFormatter.createErrorObject({
                                    status: 400,
                                    message: "Unable to save entity",
                                    details: err.message
                                });
                            } else {
                                errorObject = err;
                            }

                            entitiesService.informEntityTypeAboutError(entity, errorObject);
                        });
                }
            })
            .catch(err => {
                logger.error("[entityConsumer] [receiveEntity] Error Occurred");
                logger.error(err);

                // TODO
            });
    };

    let receiveState = function () {
        sqsHelper.receive(entityStateQueue)
            .then((messagePayload) => {
                receiveState();
                if (messagePayload.Messages === undefined) {
                    logger.info("[entityConsumer] [receiveState] No message received");
                } else {
                    logger.info("[entityConsumer] [receiveState] Entity State Received", messagePayload.Messages[0]);
                    logger.info("[entityConsumer] [receiveState] Entity Id", messagePayload.Messages[0].Attributes);

                    let message = messagePayload.Messages[0];
                    let state = JSON.parse(message.Body);
                    let entityId = message.MessageAttributes.entityId.StringValue;
                    let deleteHandle = message.ReceiptHandle;

                    return validator.validateUpdateEntity(state)
                        .then((state) => {
                            logger.info("[entityConsumer] [receiveState] State Validated", state);
                            let details = {
                                changeSource: state.changeSource,
                                sourceCode: state.sourceCode,
                                nextState: state.nextState,
                                details: state.details
                            };

                            return entitiesService.updateEntity(entityId, details);
                        })
                        .then((state) => {
                            logger.info("[entityConsumer] [receiveState] Deleting message from Queue", message.Body);
                            return sqsHelper.del(entityQueue, deleteHandle);
                        })
                        .catch(err => {
                            logger.error("[entityConsumer] [receiveState] Error Occurred while updating entity state, entityId", state, entityId);
                            logger.error(err);
                        });
                }
            })
            .catch(err => {
                logger.error("[entityConsumer] [receiveState] Error Occurred");
                logger.error(err);

                // TODO
            });
    };

    eventHandler.on(dbConnectEvent, function () {
        logger.info("[entityConsumer] DB Connected, subscribing queue");
        receiveEntity();
        receiveState();
    });

    return {
        receiveEntity,
        receiveState
    };
};