"use strict";

module.exports = app => {
    let AWS = app.helpers.aws;
    let sqs = new AWS.SQS();

    function del (queueName, deleteHandle) {
        return new Promise((resolve, reject) => {
            let params = {
                QueueUrl: queueName,
                ReceiptHandle: deleteHandle
            };

            sqs.deleteMessage(params, function (err, data) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(data);
                }
            });
        });
    }

    function receive (queueName) {
        return new Promise((resolve, reject) => {
            let params = {
                QueueUrl: queueName,
                AttributeNames: [
                    "All"
                ],
                MessageAttributeNames: [
                    "."
                ],
                WaitTimeSeconds: 5
            };

            sqs.receiveMessage(params, function (err, data) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(data);
                }
            });
        });
    };

    return {
        del,
        receive
    };
};