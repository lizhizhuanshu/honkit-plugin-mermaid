const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const datauri = require('datauri/sync');

module.exports = {
    // Map of hooks
    hooks: {},

    // Map of new blocks
    blocks: {
        code: (block) => {
            const lang = block.kwargs.language;
            if (lang !== 'mermaid') {
                return block;
            }
            try {
                block.body = toSvg(block);
            } catch (ex) {
                console.error(ex);
            }
            return block;
        }
    },

    // Map of new filters
    filters: {}
};

const PREFIX = "_book/tmp"

const toSvg = block => {
    const source = block.body;
    const hash = crypto.createHash('sha1').update(source).digest('hex');
    const mmd = path.resolve(path.join('.', `${PREFIX}_${hash}.mmd`));
    const svg = path.resolve(path.join('.', `${PREFIX}_${hash}.svg`));
    const configFilePath = path.resolve(path.join('.', `puppeteer-config.json`));
    const config = !fs.existsSync(mmd) ? '' : `-p ${configFilePath}`;
    if (!fs.existsSync(mmd)) {
        fs.writeFileSync(mmd, source, {encoding: 'utf-8'});
    }
    if (!fs.existsSync(svg)) {
        execSync(`npx mmdc ${config} -i ${mmd} -o ${svg}`);
    }
    const result = fs.readFileSync(svg, {encoding: 'utf-8'});
    fs.rmSync(mmd);
    fs.rmSync(svg);
    return result;
}
