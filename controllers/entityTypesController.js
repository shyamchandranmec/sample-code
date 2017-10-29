"use strict";

module.exports = app => {
    let validator = app.validators.entityTypesValidator;
    let entityTypesService = app.services.entityTypesService;

    /**
     * @api {POST} /entityTypes                         Create entityType
     * @apiDescription register a new entityType
     * @apiVersion 1.1.1
     * @apiName Create entityType
     * @apiGroup Entity Type
     *
     * @apiHeader {String} Content-Type                 application/json
     *
     * @apiParam {String} type                          entityType
     * @apiParam {String} defaultState                  default state for it's entity
     * @apiParam {Object[]} states                      State transition
     * @apiParam {String} states.stateName              State identifier
     * @apiParam {String[]} states.possibleNextStates   possible next state's identifier
     * @apiParam {String[]} states.requiredProperties   meta property associated with an state
     * @apiParam {String} url                           callback url for handling any error (if Queue is used)
     *
     * @apiSuccess {String} type                        entityType
     * @apiSuccess {String} defaultState                defaultState specified
     * @apiSuccess {String} updatedAt                   when entityType was updated
     * @apiSuccess {String} createdAt                   when entityType was created
     * @apiSuccess {String} message                     validation response
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *     "updatedAt": "2016-06-13T12:30:39.228Z",
     *     "createdAt": "2016-06-13T12:30:39.228Z",
     *     "type": "orderOnline",
     *     "defaultState": "PENDING",
     *     "_id": "575ea76fbe5d4c946826232b",
     *     "states": [
     *         {
     *             "id": "pending",
     *             "stateName": "PENDING",
     *             "_id": "575ea76fbe5d4c946826232e",
     *             "requiredProperties": [],
     *             "possibleNextStates": [
     *                 "ACCEPT",
     *                 "DECLINE"
     *             ]
     *         },
     *         {
     *             "id": "accept",
     *             "stateName": "ACCEPT",
     *             "_id": "575ea76fbe5d4c946826232d",
     *             "requiredProperties": [],
     *             "possibleNextStates": [
     *                 "DELIVER",
     *                 "CANCEL"
     *             ]
     *         },
     *         {
     *             "id": "decline",
     *             "stateName": "DECLINE",
     *             "_id": "575ea76fbe5d4c946826232c",
     *             "requiredProperties": [],
     *             "possibleNextStates": []
     *         }
     *     ]
     *  }
     *
     * @apiError {Number} status                        Status Code
     * @apiError {String} message                       Description
     * @apiError {Boolean} error                        Is Error?
     *
     * @apiErrorExample {json} Duplicate entityType:
     * {
     *     "status": 400,
     *     "error": true,
     *     "message": "entityType abc already exists"
     * }
     */
    function createEntityType (req, res, next) {
        validator.validateCreateEntityType(req.body)
            .then((entityType) => entityTypesService.createEntityType(entityType))
            .then(entityType => res.send(entityType))
            .catch(err => next(err));
    }

    /**
     * @api {GET} /entityTypes/:id                      Create entityType
     * @apiDescription get an entityType by Id
     * @apiVersion 1.1.1
     * @apiName Get entityType
     * @apiGroup Entity Type
     *
     * @apiSuccess {String} type                        entityType
     * @apiSuccess {String} defaultState                defaultState specified
     * @apiSuccess {String} updatedAt                   when entityType was updated
     * @apiSuccess {String} createdAt                   when entityType was created
     * @apiSuccess {String} message                     validation response
     *
     * @apiSuccessExample {json} Response-Example:
     * {
     *     "updatedAt": "2016-06-13T12:30:39.228Z",
     *     "createdAt": "2016-06-13T12:30:39.228Z",
     *     "type": "orderOnline",
     *     "defaultState": "PENDING",
     *     "_id": "575ea76fbe5d4c946826232b",
     *     "states": [
     *         {
     *             "id": "pending",
     *             "stateName": "PENDING",
     *             "_id": "575ea76fbe5d4c946826232e",
     *             "requiredProperties": [],
     *             "possibleNextStates": [
     *                 "ACCEPT",
     *                 "DECLINE"
     *             ]
     *         },
     *         {
     *             "id": "accept",
     *             "stateName": "ACCEPT",
     *             "_id": "575ea76fbe5d4c946826232d",
     *             "requiredProperties": [],
     *             "possibleNextStates": [
     *                 "DELIVER",
     *                 "CANCEL"
     *             ]
     *         },
     *         {
     *             "id": "decline",
     *             "stateName": "DECLINE",
     *             "_id": "575ea76fbe5d4c946826232c",
     *             "requiredProperties": [],
     *             "possibleNextStates": []
     *         }
     *     ]
     *  }
     *
     * @apiError {Number} status                        Status Code
     * @apiError {String} message                       Description
     * @apiError {Boolean} error                        Is Error?
     *
     * @apiErrorExample {json} entityType not found:
     * {
     *     "status": 404,
     *     "error": true,
     *     "message": "entityType not found with id 575ea4b4be5d4c9468263327s"
     * }
     */
    function getEntityType (req, res, next) {
        let id = req.params.id;
        return validator.validateGetEntityType(id)
            .then((id) => entityTypesService.getEntityType(id))
            .then(entityType => res.send(entityType))
            .catch(err => next(err));
    }

    return {
        createEntityType,
        getEntityType
    };
};