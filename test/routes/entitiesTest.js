
"use strict";

let entityModel = app.models.entity;
let entityTypeModel = app.models.entityType;

/**
 * Test Cases for Routes
 */
describe("Entity routes test", () => {

    let entityTypeInput = {
        "type": "OOTEST",
        "defaultState": "PENDING",
        "states": [{
            "id": "1",
            "stateName": "PENDING",
            "possibleNextStates": ["ACCEPTED", "DECLINED"],
            "requiredProperties": []
        }]
    };

    before(done => {
        entityTypeModel.removeEntityTypeWithType(entityTypeInput.type)
            .then(() => entityTypeModel.createEntityType(entityTypeInput))
            .then(() => {
                done();
            }).catch(err => done(err));
    });

    after(done => {
        entityTypeModel.removeEntityTypeWithType(entityTypeInput.type)
            .then(() => {
                done();
            }).catch(err => done(err));
    });

    describe("POST method : create Entity", () => {
        let entity = {
            "clientId": "67",
            "externalId": "TESTING",
            "entityType": "OOTEST",
            "cloudSiteId": "56",
            "locationId": "32",
            "currentState": "PENDING",
            "entityMeta": {}
        };
        let id;

        after(done => {
            entityModel.removeEntityWithId(id).then(() => {
                done();
            }).catch((err) => done(err));
        });
        /**
         * Create entity Success case
         */
        it("should create entity", done => {

            request.post("/entities")
                .send(entity)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.be.json;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    expect(res.body._id).to.exist;
                    id = res.body._id;
                    done();
                });
        });

        /**
         * Create entity Failure case
         */
        it("should return 400 with error details", done => {
            let entity = {
                "entityType": "jnj",
                "cloudSiteId": "snjcjjs",
                "locationId": "jnj",
                "currentState": "dbfdh",
                "entityTypeEntityId": 34,
                "clientId": 23
            };

            request.post("/entities")
                .send(entity)
                .end((err, res) => {
                    expect(res.body).to.exist;
                    expect(res.status).to.equal(400);
                    expect(res.body.error).to.exist;
                    expect(res.body.error).to.equal(true);
                    done();
                });
        });
    });

    describe("GET Method : Get Entity", () => {
        let entity = {
            "clientId": "67",
            "externalId": "TESTING",
            "entityType": "OOTEST",
            "cloudSiteId": "56",
            "locationId": "32",
            "currentState": "PENDING"
        };
        let id;
        before(done => {
            entityModel.createEntity(entity).then((entity) => {
                id = entity._id;
                done();
            }).catch((err) => done(err));
        });
        after(done => {
            entityModel.removeEntityWithId(id).then(() => {
                done();
            }).catch((err) => done(err));
        });
        /**
         * Get entity Success case
         */
        it("should get entity", done => {
            request.get(`/entities/${id}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    expect(res.body).to.have.property("stateHistory");
                    expect(res.body).to.have.property("services");
                    expect(res.body._id).to.equal(id.toString());
                    done();
                });
        });

        //
        /**
         * Get entity Failure case
         */
        it("should return 404 status code on get request with wrong id", done => {
            request.get("/entities/wong_id")
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(404);
                    done();
                });
        });
    });

    describe("GET Method : Check Validity", () => {
        let entity = {
            "clientId": "67",
            "externalId": "TESTING",
            "entityType": "OOTEST",
            "cloudSiteId": "56",
            "locationId": "32",
            "currentState": "PENDING"
        };
        let id;
        before(done => {
            entityModel.createEntity(entity).then((entity) => {
                id = entity._id;
                done();
            }).catch((err) => done(err));
        });
        after(done => {
            entityModel.removeEntityWithId(id).then(() => {
                done();
            }).catch((err) => done(err));
        });
        /**
         * Check Validity Success case
         */
        it("should be a validated get", done => {
            request.get(`/entities/${id}/validate/ACCEPTED`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    done();
                });
        });

        /**
         * Check Validity Failure case
         */
        it("should not allow to change the state", done => {
            request.get(`/entities/${id}/validate/PENDING`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(400);
                    expect(res.body).to.exist;
                    done();
                });
        });
    });

    describe("PUT Method", () => {
        let entity = {
            "clientId": "67",
            "externalId": "TESTING",
            "entityType": "OOTEST",
            "cloudSiteId": "56",
            "locationId": "32",
            "currentState": "PENDING"
        };
        let id;
        before(done => {
            entityModel.createEntity(entity).then((entity) => {
                id = entity._id;
                done();
            }).catch((err) => done(err));
        });
        after(done => {
            entityModel.removeEntityWithId(id).then(() => {
                done();
            }).catch((err) => done(err));
        });
        /**
         * PUT : Update Entity successful case
         */
        it("should update entityMeta", done => {
            let updatedEntityData = {
                entityMeta: {
                    some: {
                        old: "school",
                        crap: "which"
                    },
                    was: {
                        not: "worth",
                        reading: "or typing ¯\\_(ツ)_/¯"
                    }
                }
            };
            request.patch(`/entities/${id}`)
                .send(updatedEntityData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    expect(res.body.entityMeta).to.deep.equal(updatedEntityData.entityMeta);
                    done();
                });
        });

        /**
         * PUT : Update Entity Failure case
         */
        it("Validation should fail while updating entity", done => {
            let updatedEntityData = {
                changeSource: "entityType",
                sourceCode: "oo",
                nextState: "PENDING"
            };
            request.put(`/entities/${id}`)
                .send(updatedEntityData)
                .end((err, res) => {
                    expect(res.status).to.equal(400);
                    expect(res.body).to.exist;
                    expect(res.body.error).to.equal(true);
                    done();
                });
        });
    });

});

