"use strict";

var AWS = require("aws-sdk");

module.exports = app => {
    let awsConfig = app.config.envVariables.aws;
    AWS.config.update({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        region: awsConfig.region
    });

    return AWS;
};