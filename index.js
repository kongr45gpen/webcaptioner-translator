// Import path and url dependencies
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express'
import expressWs from 'express-ws'
import http from 'http'
import request from 'request'

import config from './config.js'
import * as deepl from 'deepl-node';

console.log("Starting server on port " + config.port + "...");

let app = express();
let server = http.createServer(app).listen(config.port);    

let wsInstance = expressWs(app, server);

app.use(express.static(__dirname + '/views'));
app.use(express.text())
app.use(express.json())

let translator;
if (config.translator == "deepl") {
    translator = new deepl.Translator(config.deepl.key);
}

app.post('/hook', (req, res) => {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    console.debug("Received text: ", data);

    if (config.translator == "googlescript") {
        const TRANS_URL = 
            'https://script.google.com/macros/s/' 
            + config.googlescript.deployment_id 
            + '/exec?source=' + config.language_from 
            + '&target=' + config.language_to;
        const url = TRANS_URL + "&text=" + encodeURIComponent(data['transcript']);
        request(url, (err, response, body) => {
            if (err) { return console.log(err); }
            console.log("Translated text: ", body);

            for (let client of wsInstance.getWss().clients) {
                client.send(JSON.stringify({ "transcript": data['transcript'], "translation": body }));
            };
        });
    } else if (config.translator == "deepl") {
        translator
            .translateText(data['transcript'], config.language_from, config.language_to)
            .then((translation) => {
                console.log("Translated text: ", translation);
                for (let client of wsInstance.getWss().clients) {
                    client.send(JSON.stringify({ "transcript": data['transcript'], "translation": translation }));
                };
            })
            .catch((err) => {
                console.error(err);
            });
    } else if (config.translator == "none") {
        for (let client of wsInstance.getWss().clients) {
            client.send(JSON.stringify({ "transcript": data['transcript'], "translation": data['transcript'] }));
        };
    } else {
        console.error("Invalid translator: ", config.translator);
    }

    res.status(200).send();
});

app.ws('/ws', async function(ws, req) {
});

