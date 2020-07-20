const stateURLFactory = (staticAssetsBase) => (route) => {
  const fileName = 'state.json';
  const routerBase = '<%= options.routerBase %>';
  const normalizedPath = route.path.replace(/\/+$/, '');

  return `${document.location.origin}${routerBase}${staticAssetsBase}${normalizedPath}/${fileName}`;
};

export default (ctx, inject) => {
  // passing staticAssetsBase as plugin options gives wrong timestamp
  const { staticAssetsBase } = process.server ? ctx.ssrContext : ctx.nuxtState;
  const stateURL = stateURLFactory(staticAssetsBase);
  ctx.$stateURL = stateURL;
  inject('stateURL', stateURL);
};
