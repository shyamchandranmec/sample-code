"use strict";

module.exports = app => {
    let NoResultFound = app.exceptions.noResultFound;
    let logger = app.helpers.logger;
    let client = app.redis.redis;

    /**
     * return value of key when fulfilled
     *
     * @param key
     */
    function getValue (key) {
        return new Promise((resolve, reject) => {
            client.get(key, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [getValue] Some Error Occurred - key - ${key}`);
                    logger.info(err);

                    return reject(err);
                } else {
                    if (reply) {
                        logger.info(`[redis] [getValue] Value Found - key, value - ${key}, ${reply}`);

                        return resolve(reply);
                    } else {
                        logger.info(`[redis] [getValue] Value Not Found or Empty - key - ${key}, ${reply}`);

                        return reject(new NoResultFound(`No Value Found for key ${key}`));
                    }
                }
            });
        });
    }

    /**
     * return value of key from specified hash
     *
     * @param hash
     * @param key
     * @return Promise
     */
    function hgetValue (hash, key) {
        return new Promise((resolve, reject) => {
            client.hget(hash, key, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [hgetValue] Some Error Occurred - hash, key - ${hash}, ${key}`);
                    logger.error(err);

                    return reject(err);
                } else {
                    if (reply) {
                        logger.info(`[redis] [hgetValue] Value found - hash, key, value - ${hash}, ${key}, ${reply}`);

                        return resolve(reply);
                    } else {
                        logger.info(`[redis] [hgetValue] Value not found - hash, key - ${hash}, ${key}`);

                        return reject(new NoResultFound(`No Value Found for key ${key} in hash ${hash}`));
                    }
                }
            });
        });
    }

    /**
     * Return value when fulfilled
     *
     * @param key
     * @param value
     */
    function setValue (key, value) {
        return new Promise((resolve, reject) => {
            client.set(key, value, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [setValue] Some Error Occurred - key - ${key}`);
                    logger.error(err);

                    return reject(err);
                } else {
                    logger.info(`[redis] [setValue] Value Set - key - ${key}`);

                    return resolve(value);
                }
            });
        });
    }

    /**
     * set value of key into specified hash
     *
     * @param hash
     * @param key
     * @return Promise
     */
    function hsetValue (hash, key, value) {
        return new Promise((resolve, reject) => {
            client.hset(hash, key, value, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [hsetValue] Some Error Occurred - hash, key - ${hash}, ${key}`);
                    logger.error(err);

                    return reject(err);
                } else {
                    logger.info(`[redis] [hsetValue] Value Set - hash, key - ${hash}, ${key}`);

                    return resolve(value);
                }
            });
        });
    }

    /**
     * set expiry of a key
     *
     * @param key
     * @param expiry - seconds
     * @returns {Promise}
     */
    function expire (key, expiry) {
        return new Promise((resolve, reject) => {
            client.expire(key, expiry, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [expire] Some Error Occurred - key, expiry - ${key}, ${expiry}`);
                    logger.error(err);

                    return reject(err);
                } else {
                    logger.info(`[redis] [expire] Expiry Set - key, expiry, reply - ${key}, ${expiry}, ${reply}`);

                    return resolve();
                }
            });
        });
    }

    /**
     * delete given key
     *
     * @param key
     * @returns {Promise}
     */
    function del (key) {
        return new Promise((resolve, reject) => {
            client.del(key, function (err, reply) {
                if (err) {
                    logger.error(`[redis] [del] Some Error Occurred - key - ${key}`);
                    logger.error(err);

                    return reject(err);
                } else {
                    logger.info(`[redis] [del] del successful - key - ${key}`);

                    return resolve();
                }
            });
        });
    }

    /**
     * set value (JSON Object) of key in hash
     *
     * @param hash
     * @param key
     * @param value - Object
     * @returns {Promise}
     */
    function updateJSONObject (identifier, id, value, expiry) {
        expiry = expiry || 600;
        return new Promise((resolve, reject) => {
            let key = `${identifier}:${id}`;

            logger.info("[redis] [updateObject] identifier, id, value, expiry -", identifier, id, value, expiry);

            return setValue(key, JSON.stringify(value))
                .then((value) => {
                    expire(key, expiry);

                    return resolve(value);
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get value (JSON Object) of key from hash
     *
     * @param hash
     * @param key
     * @returns {Promise}
     */
    function getJSONObject (identifier, id) {
        return new Promise((resolve, reject) => {
            logger.info(`[redis] [getJSONObject] identifier, id - ${identifier}, ${id}`);

            let key = `${identifier}:${id}`;

            getValue(key)
                .then((entity) => resolve(JSON.parse(entity)))
                .catch((err) => reject(err));
        });
    }

    /**
     * Remove value for a key
     *
     * @param identifier
     * @param id
     * @returns {*}
     */
    function removeJSONObject (identifier, id) {
        logger.info(`[redis] [removeJSONObject] identifier, id - ${identifier}, ${id}`);

        let key = `${identifier}:${id}`;

        return del(key);
    }

    return {
        setValue,
        getValue,
        hsetValue,
        hgetValue,
        expire,
        del,
        updateJSONObject,
        getJSONObject,
        removeJSONObject
    };
};