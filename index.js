const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {
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
    hooks: {
        "page:before": page => {
            page.content = page.content.replaceAll("```http request", "```");
            return page;
        }
    }
};
const PREFIX = "_book/tmp";
const toSvg = (block) => {
    const source = block.body;
    const hash = crypto.createHash('sha1').update(source).digest('hex');
    const mmd = path.resolve(path.join('.', `${PREFIX}_${hash}.mmd`));
    const svg = path.resolve(path.join('.', `${PREFIX}_${hash}.svg`));
    const config = path.resolve(path.join('.', `puppeteer-config.json`));
    const configFileOption = !fs.existsSync(mmd) ? '' : `-p ${config}`;
    if (!fs.existsSync(mmd)) {
        fs.writeFileSync(mmd, source, {encoding: 'utf-8'});
    }
    if (!fs.existsSync(svg)) {
        execSync(`npx mmdc ${configFileOption} -i ${mmd} -o ${svg}`);
    }

    const output = fs.readFileSync(svg, {encoding: 'utf-8'});
    fs.rmSync(svg);
    fs.rmSync(mmd);
    return output;
}
