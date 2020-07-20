const fs = require('fs').promises;
const path = require('path');

const getAbsoluteDir = (distDir, staticAssetsDir, route) => {
  return `${distDir}${staticAssetsDir}${route}`;
};

const writeState = async (stateData, dir) => {
  const filePath = path.resolve(dir, `state.json`);
  return fs.writeFile(filePath, stateData ? JSON.stringify(stateData) : '', 'utf8');
};

module.exports = function extractor({ blacklist }) {
  const distDir = this.nuxt.options.export.dir || this.nuxt.options.generate.dir ;

  if (this.nuxt.options.mode === 'spa') {
    console.warn('nuxt export is running in spa-only mode, so nuxt-state-extractor will be ignored');
    return null;
  }

  const routerBase = this.nuxt.options.router.base.slice(0, -1);
  const staticAssetsBase = this.options.generate.staticAssets.versionBase;

  const { nuxt } = this;

  nuxt.hook('vue-renderer:ssr:context', async (ctx) => {
    if (!this.nuxt.options.generate.subFolders) throw new Error('generate.subFolders should be true for nuxt-state-extractor');
    if (blacklist && blacklist.includes(ctx.url)) return page;

    const dir = getAbsoluteDir(distDir, staticAssetsBase, ctx.url);

    nuxt.hook('export:done', async (page) => {
      try {
        await writeState(ctx.nuxt.state, dir);
      } catch (err) {
        console.error('nuxt-state-extractor');
        console.error(err);
      } finally {
        return page;
      }
    })
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    options: {
      routerBase,
      staticAssetsBase,
    },
  });
};

module.exports.meta = require('../package.json');
