import { createDefaultConfig } from '@open-wc/building-rollup';
const indexHTML = require('./node_modules/rollup-plugin-index-html');
import copy from 'rollup-plugin-cpy';
import fs from 'fs';
import rimraf from 'rimraf';

const config = createDefaultConfig({
    input: './index.html',
});

config.plugins.push(
    rimraf.sync('dist'),
    copy({
        // copy over all images files
        files: ['images/*.*', 'vincentprice.zip'],
        dest: 'dist',
        options: {
            // parents makes sure to preserve the original folder structure
            parents: true
        }
    })
);

export default config;
