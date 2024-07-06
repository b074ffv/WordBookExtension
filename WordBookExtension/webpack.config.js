const path = require('path');

module.exports = {
    entry: {
        content: './js/content.js',
    },
    output: {
        filename: 'content.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
};