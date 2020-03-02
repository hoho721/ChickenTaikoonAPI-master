const presets = ["@babel/env"];
const plugins = ["@babel/plugin-transform-runtime"];

module.exports = function (api) {
    api.cache(true);

    return {
        presets,
        plugins
    };
};