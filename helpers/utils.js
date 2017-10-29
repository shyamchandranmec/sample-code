"use strict";

module.exports = app => {
    let logger = app.helpers.logger;

    /**
     * Execute cacheMethod, then if no result found,
     * then chains with persistenceMethod,
     * if successful, also triggers updateMethod with value returned
     * from persistenceMethod
     *
     * (Expects binded functions)
     *
     * @param cacheMethod
     * @param persistenceMethod
     * @param updateMethod
     * @returns {Promise}
     */
    let fetchFromCacheOrPersistenceStorage = function (cacheMethod, persistenceMethod, updateMethod) {
        return new Promise((resolve, reject) => {
            cacheMethod()
                .then((value) => {
                    logger.info(`[fetchFromCacheOrPeristanceStorage] [cacheMethod] Fetched from Cache - value - ${value}`);

                    return resolve(value);
                })
                .catch((err) => {
                    logger.info("[fetchFromCacheOrPewristanceStorage] [cacheMethod] Not found using Cache Method");
                    logger.info("[fetchFromCacheOrPeristanceStorage] [cacheMethod] Fetching from Persistant Storage");
                    logger.info(err);

                    return persistenceMethod()
                        .then((value) => {
                            logger.info(`[fetchFromCacheOrPeristanceStorage] [persistanceMethod] Fetching Complete, Updating Cache - value - ${value}`);

                            updateMethod(value);

                            return resolve(value);
                        })
                        .catch((err) => reject(err));
                });
        });
    };

    return {
        fetchFromCacheOrPersistenceStorage
    };
};