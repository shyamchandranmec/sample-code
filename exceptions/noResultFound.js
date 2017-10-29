"use strict";

module.exports = app => {
    class NoResultFound extends Error {
        constructor (message) {
            super(message);
            this.name = "NoResultFound";
            this.message = "No result found" || message;
        }
    }

    return NoResultFound;
};
