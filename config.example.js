var config = {};

config.googlescript = {}
config.deepl = {}
config.context = {}

config.port = 3000;
config.translator = "deepl";
config.language_from = "en";
config.language_to = "fr";

config.googlescript.deployment_id = "deployment_id_here";

config.deepl.key = "authentication_key_here";

config.context.timeout = 3000;
config.context.words_before = 20;
config.context.words_main = 20;
config.context.words_after = 4;

export default config;