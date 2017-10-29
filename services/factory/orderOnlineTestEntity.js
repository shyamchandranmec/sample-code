"use strict";

module.exports = app => {

    let BaseEntity = app.services.factory.baseEntity;

    class OrderOnlineTestEntity extends BaseEntity {

        constructor (entityModel, conf) {
            super(entityModel, conf);
            this.entityModel = entityModel;
        }
    }

    return OrderOnlineTestEntity;
};