"use strict";

let entityTypeModel = app.models.entityType;

describe("EntityTypes Route test", () => {
    let entityType = {
        type: "orderOnline",
        defaultState: "PENDING",
        states: [
            {
                id: "pending",
                stateName: "PENDING",
                possibleNextStates: ["ACCEPT", "DECLINE"],
                requiredProperties: []
            },
            {
                id: "accept",
                stateName: "ACCEPT",
                possibleNextStates: ["DELIVER", "CANCEL"],
                requiredProperties: []
            },
            {
                id: "decline",
                stateName: "DECLINE",
                possibleNextStates: [],
                requiredProperties: []
            }
        ]
    };

    describe("POST method", () => {

        before(done => {
            entityTypeModel.removeEntityTypeWithType(entityType.type)
                .then(result => done());
        });

        after(done => {
            entityTypeModel.removeEntityTypeWithType(entityType.type)
                .then(result => done());
        });

        /**
         * Create EntityType Successful Case
         */
        it("should create entityType", done => {

            request.post("/entityTypes")
                .send(entityType)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.be.json;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    expect(res.body._id).to.exist;
                    done();
                });
        });

        /**
         * Create EntityType Failure Case
         */
        it("should fail while creating entityType to prevent duplicate entry", done => {

            request.post("/entityTypes")
                .send(entityType)
                .end((err, res) => {
                    expect(res.body.status).to.equal(400);
                    expect(res.body).to.exist;
                    done();
                });
        });
    });

    describe("GET Method", () => {
        let id;

        before(done => {
            entityTypeModel.createEntityType(entityType)
                .then(result => {
                    id = result._id;
                    done();
                });
        });

        after(done => {
            entityTypeModel.removeEntityTypeWithType(entityType.type)
                .then(result => done());
        });

        /**
         * Get EntityType Success Case
         */
        it("should get entityType", done => {
            request.get(`/entityTypes/${id}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    expect(res.body).to.exist;
                    expect(res.body._id).to.equal(id.toString());
                    done();
                });
        });

        /**
         * Get EntityType Failure Case
         */
        it("should return 404 status code on get request with wrong id", done => {
            request.get("/entityTypes/wong_id")
                .end((err, res) => {
                    expect(res.status).to.equal(404);
                    done();
                });
        });
    });
});
