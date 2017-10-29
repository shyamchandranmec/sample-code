"use strict";

module.exports = app => {

    let BaseEntity = app.services.factory.baseEntity;

    class ManualOrderEntity extends BaseEntity {

        constructor (entityModel, conf) {
            super(entityModel, conf);
            this.entityModel = entityModel;
        }
    }
    return ManualOrderEntity;
};