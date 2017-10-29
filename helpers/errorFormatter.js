"use strict";

function createErrorObject (data) {

    return {
        status: data.status || 500,
        error: true,
        message: data.message,
        details: {
            message: data.details || "Some error occurred"
        }
    };
}

function createErrorObjectFromJoiErrors (err, objectName) {
    let error;
    let validationErrors;
    let prefix = (objectName && `${objectName} `) || "";

    if (err && err.details) {
        validationErrors = err.details.map(errInfo => {
            return errInfo.message;
        });
        error = createErrorObject({
            status: 400,
            message: `${prefix}Validation failed : ${JSON.stringify(validationErrors)}`,
            details: validationErrors
        });
        return error;
    }
}

module.exports = {
    createErrorObject,
    createErrorObjectFromJoiErrors
};