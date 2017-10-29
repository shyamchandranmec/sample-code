"use strict";

let supertest = require("supertest");
let chai = require("chai");
let app = require("../app");

global.app = app;
global.request = supertest(app);
global.expect = chai.expect;