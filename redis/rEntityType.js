"use strict";

module.exports = app => {
    let redisCache = app.redis.commands;
    let identifier = "MB_ENTITY_TYPE";

    let updateEntityType = (key, value) => redisCache.updateJSONObject(identifier, key, value);

    let getEntityType = (key) => redisCache.getJSONObject(identifier, key);

    let removeEntityType = (key) => redisCache.removeJSONObject(identifier, key);

    return {
        updateEntityType,
        getEntityType,
        removeEntityType
    };
};