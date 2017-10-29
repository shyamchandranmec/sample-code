
"use strict";

module.exports = app => {

    let logger = app.helpers.logger;
    let Pubnub = app.services.publisherFactory.pubnub;

    let publisherMapping = {
        pubnub: Pubnub
    };

    function getPublisher (publisherType, entity) {
        logger.info(`Creating a publisher object of type : ${publisherType}`);
        return new publisherMapping[publisherType](entity);
    }

    return {
        getPublisher
    };
};
