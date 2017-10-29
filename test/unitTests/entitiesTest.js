"use strict";

let entityFactory = app.services.factory.entityFactory;
let OrderOnlineEntity = app.services.factory.orderOnlineEntity;
let BaseEntity = app.services.factory.baseEntity;
let appConfig = app.config.envVariables;
let publisherFactory = app.services.publisherFactory.publisherFactory;

/**
 * Testing individual functions
 */
describe("Test Cases for functions", () => {

    let dummyEntity = {
        "_id": "5720a04ac96fb6cc39c40d48",
        "clientId": "34",
        "externalId": "oo-42",
        "entityType": "OO",
        "cloudSiteId": "1672",
        "locationId": "40"
    };

    let conf = {
        "changeSource": "product",
        "sourceCode": "TEST",
        "nextState": "ACCEPTED",
        "details": [{
            "test": "true"
        }]
    };

    /**
     * Success case for entity factory : add a test case when a new entity is added
     */
    describe("State Change : Creating entity factory : Success Case", () => {
        it("should create a entity object from the factory", done => {
            let entity = entityFactory.getEntity(dummyEntity);
            expect(entity).to.exist;
            expect(entity instanceof OrderOnlineEntity).to.equal(true);
            done();
        });

        it("should create a entity object of baseentity from the factory", done => {
            let entity = entityFactory.getEntity(dummyEntity);
            expect(entity).to.exist;
            expect(entity instanceof BaseEntity).to.equal(true);
            done();
        });
    });

    /**
     *  Success case for validateForChangeState : when state Validation is successful
     */
    describe("State Validation : Update should be successful", () => {
        it("should be successful while updating state of entity", done => {
            let entity = entityFactory.getEntity(dummyEntity, conf);
            let nextState = "PENDING";
            let states = ["PENDING", "ACCEPTED"];

            entity.validateForChangeState(states, nextState)
                .then(() => {
                    done();
                }).catch((err) => {
                });
        });
    });

    /**
     * Failure case for validateForChangeState : when state Validation Fails
     */
    describe("State Validation : Update should fail", () => {
        it("should fail while updating state of entity", done => {
            let entity = entityFactory.getEntity(dummyEntity);
            let nextState = "PENDING";
            let states = ["ACCEPTED", "ACCEPTED"];

            entity.validateForChangeState(states, nextState)
                .then(() => {
                    done(new Error("test case failed"));
                }).catch((err) => {
                    expect(err).to.exist;
                    expect(err.status).to.equal(400);
                    done();
                });
        });
    });

    /**
     * Failure case for validateForChangeState : when state array is null
     */
    describe("State Validation : Update should fail", () => {
        it("should fail while updating state of entity", done => {
            let entity = entityFactory.getEntity(dummyEntity);
            let nextState = "ACCEPTED";
            let states = [];
            entity.validateForChangeState(states, nextState)
                .then(() => {
                    done(new Error("test case failed"));
                }).catch((err) => {
                    expect(err).to.exist;
                    expect(err.status).to.equal(400);
                    done();
                });
        });
    });

    /**
     * Failure case for channelList Creation
     */
    describe("Create Channel List", () => {
        it("should fail while creating channel list", done => {
            let publisher = publisherFactory.getPublisher(appConfig.publisher);
            publisher.createChannels().then(() => {
                done(new Error("Test Case Failed"));
            }).catch((err) => {
                expect(err).to.exist;
                expect(err.status).to.equal(404);
                done();
            });
        });
    });
});
