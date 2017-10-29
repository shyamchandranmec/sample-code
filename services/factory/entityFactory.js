"use strict";

module.exports = app => {

    let entityFactory = app.services.factory;
    let orderOnlineEntity = entityFactory.orderOnlineEntity;
    let orderOnlineTestEntity = entityFactory.orderOnlineTestEntity;
    let tableReservationEntity = entityFactory.tableReservationEntity;
    let manualOrderEntity = entityFactory.manualOrderEntity;
    let aggregatorOrderEntity = entityFactory.aggregatorOrderEntity;
    let BaseEntity = entityFactory.baseEntity;

    let logger = app.helpers.logger;

    let entityTypeMapping = {
        OO: orderOnlineEntity,
        TR: tableReservationEntity,
        MO: manualOrderEntity,
        OOTEST: orderOnlineTestEntity,
        AG: aggregatorOrderEntity
    };

    function getEntity (entityModel) {
        if (!entityModel && !entityModel.entityType) {
            return;
        }
        logger.info(`Creating a entity validator from factory: entityType : ${entityModel.entityType}`);
        let Entity = entityTypeMapping[entityModel.entityType];

        if (!Entity) {
            return (new BaseEntity(entityModel));
        } else {
            return (new Entity(entityModel));
        }
    }

    return {
        getEntity
    };
};

