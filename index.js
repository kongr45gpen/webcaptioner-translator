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
import ContextBuffer from './lib/contextBuffer.js';

import colors from 'colors';
colors.enable();

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

const context = new ContextBuffer(
    config.context.words_before, 
    config.context.words_main, 
    config.context.words_after,
    config.context.timeout
);

const translateContext = (context) => {
    const context_state = context.get();
    const original_text = context_state[1].join(' ');
    const translation_text = context_state[0].join(' ') + ' <main>' + context_state[1].join(' ') + '</main> ' + context_state[2].join(' ');

    if (config.translator == "googlescript") {
        const TRANS_URL = 
            'https://script.google.com/macros/s/' 
            + config.googlescript.deployment_id 
            + '/exec?source=' + config.language_from 
            + '&target=' + config.language_to;
        const url = TRANS_URL + "&text=" + encodeURIComponent(translation_text);
        request(url, (err, response, body) => {
            if (err) { return console.log(err); }
            gotTranslatedText(original_text, body)
        });
    } else if (config.translator == "deepl") {
        translator
            .translateText(translation_text, config.language_from, config.language_to, {
                tagHandling: 'xml',
                nonSplittingTags: ['main']
            })
            .then((translation) => {
                gotTranslatedText(original_text, translation.text)
            })
            .catch((err) => {
                console.error(err);
            });
    } else if (config.translator == "none") {
        gotTranslatedText(original_text, translation_text);
    } else {
        console.error("Invalid translator: ", config.translator);
    }
};

const gotTranslatedText = (original, translation) => {
    // Identify context
    const re = /^(.*?)\<main\>(.*)\<\/main\>(.*?)$/;
    const found = translation.match(re);
    if (found) {
        translation = found[2];
        translation = translation.replace(/\<\/?main\>/g, '');
        console.log("Translated text: " + found[1] + ' ' + found[2].magenta + ' ' + found[3])
    } else {
        console.log("Translated text: ", translation);
        console.warn("No context found in translation: ", translation);
    }

    for (let client of wsInstance.getWss().clients) {
        client.send(JSON.stringify({ "transcript": original, "translation": translation }));
    };
};

app.post('/hook', (req, res) => {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    console.debug("Received text (context " + context.quickLog() + "): ", data);

    const ready = context.addWords(data['transcript'].split(' '));
    if (ready) {
        translateContext(context);
    }

    res.status(200).send();
});

setInterval(() => {
    if (context.isTooLate()) {
        console.debug("Context timeout reached, translating (context " + context.quickLog() + ")...");
        context.mergeAfter();
        translateContext(context);
    }
}, config.context.timeout / 5);


app.ws('/ws', async function(ws, req) {
});

