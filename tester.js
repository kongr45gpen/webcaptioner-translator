// Sends out some test requests to the server of a random transcript and translation.

import request from 'request'

const TRANSCRIPT = [
    "Hello, my name is Alex.",
    "I am a software engineer.",
    "I am from the United States.",
    "I am 25 years old.",
    "I like to play video games.",
    "The best way to make toast is to slowly toast it.",
    "I like to eat toast with butter and jam.",
    "Some fun facts about the dotted quarter pound is that no one could really predict how these proportions would",
    "amount to audio engineering. In fact, taking the case of the recent backlash of the ISS, one can see how",
    "a 10-day event without proper auditioning can cause a pecuniary flux. This is what we need, no, why we need",
    "more borderline approaches to inhibit measuring systems. And I think, as an experienced member of this",
    "community, that we all, yes I'm talking to you, can deflect the current state of the union. Particularly",
    "machinery and classic literature is invented in a way that does not contradict what a minor flow in the",
    "operation. Yes hello, this is customer support, how may I help you. Yes bonjour, I would like a repair on",
    "my bedside lamp. What is wrong with your bed lamp? Well it's too bright. I see, and what is the problem",
    "with that? Well I can't sleep. Well why don't you turn off the bed lamp so you can sleep? Hmmmm (murmurs)",
    "I understand, uhhhhmmm, I didn't explain my problem to you correctly. You see the bed lamp is a bit",
    "too extremely bright. Extremely? Yes extremely. Like, I open it right, and it blows my eyes first of all",
    "but that's fine I'm used to those kinds of situations, but the light is so much that even when I turn it off",
    "it lingers around. Uhm that's impossible no? It would seem so yes. But then I did some reading on physics and",
    "found out that light actually has a travel speed, you see, and light travels very fast but not infinite fast",
    "Oh? Yes indeed, and now, here's where it gets interesting, right, because my room is big and the light is so much",
    "that a few minutes after I turn my lamp off it still lingers around. Uhm that sounds impossible though. It does,",
    "I know, but it's physically explainable. No no I don't think so, I mean sure I can send a technician over",
    "but I think if you had so much light your house would instantly go up in flames. Oh. Yes. But I'm not using",
    "it in my house. uhhhh. I'm using it in my office. You sleep in your office? Uhh I like to take a multimodal sleep",
    "Okay fine. But still my point stands. Uhhhhh. You see maybe you're just using an outdated incadescent light bulb",
    "and seeing the, uhm, how do you call it, just the temperature on the wirey part, yes, the filament, getting lower?",
    "oh oh uhm i see hmmm yeah that uhhh that makes sense. Perfect, thank you for calling customer support. Bye"
]

const WORD_SPLIT = 20;
const DELAY_MS = 5000;

const transcript_words = TRANSCRIPT.join(' ').split(' ');

while (true) {
    // Iterate every WORD_SPLIT words
    for (let i = 0; i < transcript_words.length; i += WORD_SPLIT) {
        const text = transcript_words.slice(i, i + WORD_SPLIT).join(' ');
        const url = 'http://localhost:3000/hook';
        request.post(url, { json: { transcript: text } }, (err, res, body) => {
            if (err) { return console.log(err); }
            console.log("Sent text: ", text);
        });

        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
}
