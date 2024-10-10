"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const client = new ioredis_1.default({
    port: 6379,
    host: "redis",
    // username: "default",
    // password: "my-secret",
    // db: 0,
});
exports.client = client;
if (client) {
    client.geoadd("school:nearby", 77.33474536539075, 28.669560620122354, "Bal Bharti School", 77.33802882297238, 28.670751023159852, "DAV Public School", 77.32630195222703, 28.667108064983225, "Vidya Bharti School", 77.32910742436047, 28.663474501695475, "Greenfield Public School", 77.32640547571492, 28.66285624290201, "DAV Centenary School", 77.32170297380367, 28.65708874580578, "Deep Memorial Public School", 77.31719213366671, 28.66126710916646, "St Joseph School", 77.31808192193483, 28.667725018694213, "Arwachin School", 77.30752359667002, 28.657242043445493, "Bal Vidya Mandir School", 77.30871029230201, 28.65719274968194, "Bharat National Public Shool ", 77.30844346133114, 28.65780275837615, "RSBV Surajmal Vihar School");
    // geoLoc.then((val) => console.log(val)).catch((err) => console.error(err))
}
