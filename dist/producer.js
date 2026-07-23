"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const readline_1 = __importDefault(require("readline"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = client_1.kafka.producer();
        console.log('Connecting Producer');
        yield producer.connect();
        console.log('Producer Connected Successfully');
        rl.setPrompt('> ');
        rl.prompt();
        rl.on('line', function (line) {
            return __awaiter(this, void 0, void 0, function* () {
                const [riderName, location] = line.split(' ');
                yield producer.send({
                    topic: 'rider-updates',
                    messages: [
                        {
                            partition: location.toLowerCase() === 'north' ? 0 : 1,
                            key: 'location-update',
                            value: JSON.stringify({ name: riderName, location }),
                        },
                    ],
                });
            });
        }).on('close', () => __awaiter(this, void 0, void 0, function* () {
            yield producer.disconnect();
        }));
    });
}
init();
