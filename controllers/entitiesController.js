"use strict";

module.exports = app => {
    let validator = app.validators.entitiesValidator;
    let entitiesService = app.services.entitiesService;

    /**
     * @api {POST} /entities                        Register Entity
     * @apiDescription Register a new Entity with Merchant Backend
     * @apiVersion 1.1.1
     * @apiName Register Entity
     * @apiGroup Entity
     *
     * @apiHeader {String} Content-Type             application/json
     *
     * @apiParam {String} entityType                should be a valid entityType
     * @apiParam {String} cloudSiteId               cloudSiteId, which entity belongs to
     * @apiParam {String} locationId                locationId, which entity belongs to
     * @apiParam {String} externalId                origin Id of entity
     * @apiParam {String} currentState              should be a valid state of given entityType
     * @apiParam {Object} entityMeta                entityMeta for entity, if registered, should follow specific schema
     *
     * @apiParamExample {json} Request-Example:
     * {
     *      "entityType": "OO",
     *      "cloudSiteId": "23",
     *      "locationId": "38",
     *      "externalId": "TR12233",
     *      "currentState": "PENDING",
     *      "entityMeta": {}
     * }
     *
     * @apiSuccess {String} id                      Entity Id - Unique to MB
     * @apiSuccess {String} entityType              entityType given
     * @apiSuccess {String} locationId              locationId given
     * @apiSuccess {String} cloudSiteId             cloudSiteId given
     * @apiSuccess {String} externalId              origin Id of entity
     * @apiSuccess {String} entityMeta              entityMeta given
     * @apiSuccess {Object} currentStateDetails     currentStateDetails (default || given)
     * @apiSuccess {Object[]} stateHistory          An array holding state history
     * @apiSuccess {Object} services                Any other service Id
     * @apiSuccess {String} createdAt               when entity was registered to MB
     * @apiSuccess {String} updatedAt               when entity was updated in MB
     *
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *      "updatedAt": "2016-06-13T11:13:01.256Z",
     *      "createdAt": "2016-06-13T11:13:01.256Z",
     *      "entityType": "TR",
     *      "cloudSiteId": "23",
     *      "locationId": "38",
     *      "externalId": "TR12233",
     *      "currentState": "PENDING",
     *      "entityMeta": {},
     *      "currentStateDetails": {
     *          "details": {},
     *          "changedAt": "2016-06-13T11:13:01.234Z",
     *          "changedTo": "PENDING",
     *          "changedFrom": null,
     *          "sourceId": "TR",
     *          "source": "TR"
     *      },
     *      "stateHistory": [
     *          {
     *              "details": {},
     *              "changedAt": "2016-06-13T11:13:01.234Z",
     *              "changedTo": "PENDING",
     *              "changedFrom": null,
     *              "sourceId": "TR",
     *              "source": "TR"
     *          }
     *      ],
     *      "services": {},
     *      "id": "575e953dbe5d4c9468262325"
     *  }
     *
     * @apiError {String} status                    HTTP Status Code
     * @apiError {Boolean} error                    Is Error?
     * @apiError {String} message                   Error Explanation
     *
     * @apiErrorExample {json} Invalid entityMeta:
     * {
     *     "status": 400,
     *     "error": true,
     *     "message": "entityMeta Validation failed : [\"\\\"order_type\\\" is required\",\"\\\"cloud_site_id\\\" is required\",\"\\\"location_id\\\" is required\",\"\\\"id\\\" is required\",\"\\\"order_id\\\" is required\",\"\\\"order_time\\\" is required\",\"\\\"is_preorder\\\" is required\",\"\\\"preorder_time\\\" is required\",\"\\\"preorder_reminder_entry\\\" is required\",\"\\\"aggregator_name\\\" is required\",\"\\\"cart\\\" is required\",\"\\\"customer_details\\\" is required\",\"\\\"config\\\" is required\"]",
     *  }
     *
     * @apiErrorExample {json} Invalid entityType:
     * {
     *     "status": 400,
     *     "error": true,
     *     "message": "Invalid entityType"
     * }
     */
    function registerEntity (req, res, next) {
        validator.validateCreateEntity(req.body)
            .then((entity) => entitiesService.validateEntityType(entity))
            .then((entity) => entitiesService.validateEntityMeta(entity))
            .then((entity) => entitiesService.registerEntity(entity))
            .then(entity => res.send(entity))
            .catch(err => next(err));
    }

    /**
     * @api {PUT} /entities/:id                     Update state
     * @apiDescription Update the state of a registered Entity
     * @apiVersion 1.1.1
     * @apiName Update Entity State
     * @apiGroup Entity
     *
     * @apiHeader {String} Content-Type             application/json
     *
     * @apiParam {String} changeSource              originator
     * @apiParam {String} sourceCode                Unique Id of originator
     * @apiParam {Object} details                   Meta details associated with state
     * @apiParam {String} nextState                 expected state
     *
     * @apiParamExample {json} Request-Example:
     * {
     *     "changeSource": "PR",
     *     "sourceCode": "abcde",
     *     "details": {
     *         "delivery_time": 30
     *     },
     *     "nextState": "ACCEPTED"
     * }
     *
     * @apiSuccess {String} id                      Entity Id - Unique to MB
     * @apiSuccess {String} entityType              entityType given
     * @apiSuccess {String} locationId              locationId given
     * @apiSuccess {String} cloudSiteId             cloudSiteId given
     * @apiSuccess {String} externalId              origin Id of entity
     * @apiSuccess {Object} entityMeta              entityMeta given
     * @apiSuccess {Object} currentStateDetails     currentStateDetails (default || given)
     * @apiSuccess {Object[]} stateHistory          An array holding state histroy
     * @apiSuccess {Object} services                And other Id (if)
     * @apiSuccess {String} createdAt               when entity was registered to MB
     * @apiSuccess {String} updatedAt               when entity was updated in MB
     *
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *     "updatedAt": "2016-06-13T11:13:01.256Z",
     *     "createdAt": "2016-06-13T11:13:01.256Z",
     *     "entityType": "TR",
     *     "cloudSiteId": "23",
     *     "locationId": "38",
     *     "externalId": "TR12233",
     *     "currentState": "ACCEPTED",
     *     "entityMeta": {},
     *     "currentStateDetails": {
     *         "source": "PR",
     *         "sourceId": "abcde",
     *         "changedFrom": "PENDING",
     *         "changedTo": "ACCEPTED",
     *         "changedAt": "2016-06-13T16:55:46+05:30",
     *         "details": {
     *             "delivery_time": 30
     *         }
     *     },
     *     "stateHistory": [
     *         {
     *             "details": {},
     *             "changedAt": "2016-06-13T11:13:01.234Z",
     *             "changedTo": "PENDING",
     *             "changedFrom": null,
     *             "sourceId": "TR",
     *             "source": "TR"
     *         },
     *         {
     *             "source": "PR",
     *             "sourceId": "sdfghjcvb",
     *             "changedFrom": "PENDING",
     *             "changedTo": "ACCEPTED",
     *             "changedAt": "2016-06-13T16:55:46+05:30",
     *             "details": {
     *                 "delivery_time": 30
     *             }
     *         }
     *     ],
     *     "services": {},
     *     "id": "575e953dbe5d4c9468262325"
     * }
     *
     * @apiError {String} status                    HTTP Status Code
     * @apiError {Boolean} error                    Is Error?
     * @apiError {String} message                   Error Explanation
     *
     * @apiErrorExample {json} Invalid State:
     * {
     *     "status": 400,
     *     "error": true,
     *     "message": "State Transition validation failed"
     * }
     *
     *  @apiErrorExample {json} Invalid entityId:
     *  {
     *      "status": 404,
     *      "error": true,
     *      "message": "Unable to find entity with given id",
     *  }
     */
    function updateEntityState (req, res, next) {
        let id = req.params.id;
        validator.validateUpdateEntityState(req.body)
            .then((entity) => {
                let details = {
                    changeSource: entity.changeSource,
                    sourceCode: entity.sourceCode,
                    nextState: entity.nextState,
                    details: entity.details
                };

                return entitiesService.updateEntityState(id, details);
            })
            .then((entity) => res.send(entity))
            .catch(err => next(err));
    }

    /**
     * @api {PATCH} /entities/:id                   Update entityMeta
     * @apiDescription Update entityMeta (only) of an Entity
     * @apiVersion 1.1.1
     * @apiName Update Entity Meta
     * @apiGroup Entity
     *
     * @apiHeader {String} Content-Type             application/json
     *
     * @apiParam {Object} entityMeta                entityMeta
     *
     * @apiParamExample {json} Request-Example:
     * {
     *     "entityMeta": {
     *         "ab": "cdefg"
     *     }
     * }
     *
     * @apiSuccess {String} id                      Entity Id - Unique to MB
     * @apiSuccess {String} entityType              entityType given
     * @apiSuccess {String} locationId              locationId given
     * @apiSuccess {String} cloudSiteId             cloudSiteId given
     * @apiSuccess {String} externalId              origin Id of entity
     * @apiSuccess {Object} entityMeta              entityMeta given
     * @apiSuccess {Object} currentStateDetails     currentStateDetails (default || given)
     * @apiSuccess {Object[]} stateHistory          An array holding state histroy
     * @apiSuccess {Object} services                And other Id (if)
     * @apiSuccess {String} createdAt               when entity was registered to MB
     * @apiSuccess {String} updatedAt               when entity was updated in MB
     *
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *      "updatedAt": "2016-06-13T11:13:01.256Z",
     *      "createdAt": "2016-06-13T11:13:01.256Z",
     *      "entityType": "TR",
     *      "cloudSiteId": "23",
     *      "locationId": "38",
     *      "externalId": "TR12233",
     *      "currentState": "ACCEPTED",
     *      "entityMeta": {
     *          "ab": "cdefg"
     *      },
     *      "currentStateDetails": {
     *          "source": "PR",
     *          "sourceId": "abcde",
     *          "changedFrom": "PENDING",
     *          "changedTo": "ACCEPTED",
     *          "changedAt": "2016-06-13T16:55:46+05:30",
     *          "details": {
     *              "delivery_time": 30
     *          }
     *      },
     *      "stateHistory": [
     *          {
     *              "details": {},
     *              "changedAt": "2016-06-13T11:13:01.234Z",
     *              "changedTo": "PENDING",
     *              "changedFrom": null,
     *              "sourceId": "TR",
     *              "source": "TR"
     *          },
     *          {
     *              "source": "PR",
     *              "sourceId": "sdfghjcvb",
     *              "changedFrom": "PENDING",
     *              "changedTo": "ACCEPTED",
     *              "changedAt": "2016-06-13T16:55:46+05:30",
     *              "details": {
     *                  "delivery_time": 30
     *              }
     *          }
     *      ],
     *      "services": {},
     *      "id": "575e953dbe5d4c9468262325"
     *  }
     *
     * @apiError {String} status                HTTP Status Code
     * @apiError {Boolean} error                Is Error?
     * @apiError {String} message               Error Explanation
     *
     *  @apiErrorExample {json} Invalid entityId:
     *  {
     *      "status": 404,
     *      "error": true,
     *      "message": "Unable to find entity with given id",
     *  }
     */
    function updateEntityMeta (req, res, next) {
        let id = req.params.id;

        validator.validateUpdateEntityMeta(req.body)
            .then((entity) => entitiesService.validateEntityMeta(entity))
            .then((entity) => entitiesService.updateEntityMeta(id, entity.entityMeta))
            .then((entity) => res.send(entity))
            .catch(err => next(err));
    }

    /**
     * @api {GET} /entities/:id                     Get a single entity
     * @apiDescription Return entity identified by `id` (if exists)
     * @apiVersion 1.1.1
     * @apiName Get Entity
     * @apiGroup Entity
     *
     * @apiSuccess {String} id                      Entity Id - Unique to MB
     * @apiSuccess {String} entityType              entityType given
     * @apiSuccess {String} locationId              locationId given
     * @apiSuccess {String} cloudSiteId             cloudSiteId given
     * @apiSuccess {String} externalId              origin Id of entity
     * @apiSuccess {Object} entityMeta              entityMeta given
     * @apiSuccess {Object} currentStateDetails     currentStateDetails (default || given)
     * @apiSuccess {Object[]} stateHistory          An array holding state history
     * @apiSuccess {Object} services                And other Id (if)
     * @apiSuccess {String} createdAt               when entity was registered to MB
     * @apiSuccess {String} updatedAt               when entity was updated in MB
     *
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *      "updatedAt": "2016-06-13T11:13:01.256Z",
     *      "createdAt": "2016-06-13T11:13:01.256Z",
     *      "entityType": "TR",
     *      "cloudSiteId": "23",
     *      "locationId": "38",
     *      "externalId": "TR12233",
     *      "currentState": "ACCEPTED",
     *      "entityMeta": {
     *          "ab": "cdefg"
     *      },
     *      "currentStateDetails": {
     *          "source": "PR",
     *          "sourceId": "abcde",
     *          "changedFrom": "PENDING",
     *          "changedTo": "ACCEPTED",
     *          "changedAt": "2016-06-13T16:55:46+05:30",
     *          "details": {
     *              "delivery_time": 30
     *          }
     *      },
     *      "stateHistory": [
     *          {
     *              "details": {},
     *              "changedAt": "2016-06-13T11:13:01.234Z",
     *              "changedTo": "PENDING",
     *              "changedFrom": null,
     *              "sourceId": "TR",
     *              "source": "TR"
     *          },
     *          {
     *              "source": "PR",
     *              "sourceId": "abcde",
     *              "changedFrom": "PENDING",
     *              "changedTo": "ACCEPTED",
     *              "changedAt": "2016-06-13T16:55:46+05:30",
     *              "details": {
     *                  "delivery_time": 30
     *              }
     *          }
     *      ],
     *      "services": {},
     *      "id": "575e953dbe5d4c9468262325"
     *  }
     *
     * @apiError {Number} status              Status Code
     * @apiError {String} message             Description
     * @apiError {Boolean} error              Is Error?
     *
     *  @apiErrorExample {json} Invalid entityId:
     *  {
     *      "status": 404,
     *      "error": true,
     *      "message": "Unable to find entity with given id",
     *  }
     */
    function getEntity (req, res, next) {
        let id = req.params.id;
        return validator.validateGetEntity(id)
            .then((id) => entitiesService.getEntity(id))
            .then(entity => res.status(200).send(entity))
            .catch(err => next(err));
    }

    /**
     * @api {GET} /entities                     Get Entities (bulk)
     * @apiDescription Return last n (max 100) documents, as per given condition
     * @apiVersion 1.1.1
     * @apiName Get Entities
     * @apiGroup Entity
     *
     * @apiParam {Number} [count=100]           entities to get (max 100)
     * @apiParam {Number} [offset=0]            entities to skip
     * @apiParam {String} [locationIds]         comma separated locationIds to filter
     * @apiParam {String} [cloudSiteId]         specific cloudSiteId
     *
     * @apiSuccess {Boolean} success            Is Successful?
     * @apiSuccess {Number} count               count of entities returned
     * @apiSuccess {Object[]} entities          Array of entity objects
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *      "success": true,
     *      "count": 5,
     *      "entities": [
     *          { .. },
     *          { .. },
     *          { .. },
     *          { .. },
     *          { .. }
     *      ]
     * }
     *
     * @apiError {Number} status                Status Code
     * @apiError {String} message               Description
     * @apiError {Boolean} error                Is Error?
     */
    function getEntities (req, res, next) {
        if (req.query.count) {
            req.query.count = +req.query.count;
        }

        if (req.query.offset) {
            req.query.offset = +req.query.offset;
        }

        return validator.validateGetEntities(req.query)
            .then((query) => entitiesService.getEntities(query))
            .then(entities => res.status(200).send(entities))
            .catch(err => next(err));
    }

    /**
     * @api {GET} /entities/:id/validate/:nextState     Validate nextState
     * @apiDescription check if nextState is acceptable for given entityId
     * @apiVersion 1.1.1
     * @apiName Validate State
     * @apiGroup Entity
     *
     * @apiParam {String} id                            Entity Id
     * @apiParam {String} nextState                     Valid nextState
     *
     * @apiSuccess {Number} Status                      Status Code
     * @apiSuccess {String} message                     validation response
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *     "status": 200,
     *     "message": "Valid State Change"
     * }
     *
     * @apiError {Number} status                        Status Code
     * @apiError {String} message                       Description
     * @apiError {Boolean} error                        Is Error?
     *
     * @apiErrorExample {json} Invalid entityId:
     * {
     *     "status": 404,
     *     "error": true,
     *     "message": "Unable to find entity with given id",
     * }
     *
     * @apiErrorExample {json} Invalid State:
     * {
     *     "status": 400,
     *     "error": true,
     *     "message": "State Transition validation failed"
     * }
     */
    function checkValidity (req, res, next) {
        validator.validateCheckValidity(req.params)
            .then((entity) => entitiesService.checkValidity(entity))
            .then((entity) => res.send(entity))
            .catch(err => next(err));
    }

    return {
        registerEntity,
        updateEntityMeta,
        updateEntityState,
        getEntity,
        getEntities,
        checkValidity
    };
};