// Import path and url dependencies
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express'
import expressWs from 'express-ws'
import http from 'http'
import request from 'request'

// ------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------
let port = 3000;
let deployment_id = "deployment_id_here";

console.log("Starting server on port 3000...");

let app = express();
let server = http.createServer(app).listen(port);    

let wsInstance = expressWs(app, server);

app.use(express.static(__dirname + '/views'));
app.use(express.text())

let TRANS_URL = 'https://script.google.com/macros/s/' + deployment_id + '/exec?source=en&target=el';

app.post('/hook', (req, res) => {
    const data = JSON.parse(req.body);
    console.debug("Received text: ", data);

    const url = TRANS_URL + "&text=" + encodeURIComponent(data['transcript']);
    request(url, (err, response, body) => {
        if (err) { return console.log(err); }
        console.log("Translated text: ", body);

        for (let client of wsInstance.getWss().clients) {
            client.send(JSON.stringify({ "transcript": data['transcript'], "translation": body }));
        };
    });

    res.status(200).send();
});

app.ws('/ws', async function(ws, req) {
});

