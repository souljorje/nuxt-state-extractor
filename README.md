# Nuxt state extractor

Nuxt.js module that makes `nuxt generate` command to store vuex state as json file.

Ispired by [DreaMinder/nuxt-payload-extractor](https://github.com/DreaMinder/nuxt-payload-extractor).

## Benefits

✓ You can access to data from nuxtServerInit\
✓ Works with [nuxt-i18n](https://nuxt-community.github.io/nuxt-i18n/)\
✓ Uses built-in nuxt staticAssetsBase folder (timestamps, cache invalidation)

## Setup

1. Add `nuxt-state-extractor` dependency

```bash
yarn add nuxt-state-extractor
# or
npm installl nuxt-state-extractor
```

2. Define nuxt module in nuxt.config.js:

```js
{
  modules: ['nuxt-state-extractor'];
}
```

## Usage

Main purpose is integration with [nuxt-i18n](https://nuxt-community.github.io/nuxt-i18n/)

### Axios & nuxt-i18n

```js
// ./store/index.js
export const actions = {
  async nuxtServerInit({ dispatch }, context) {
    // getting some root data, e.g. header & footer
    await dispatch('getRootData', context);
  },
  getRootData({ dispatch }, context) {
    const {
      app, $stateURL, $axios, route,
    } = context;
    const apollo = app.apolloProvider.defaultClient;
    const { locale } = app.i18n;
    // if generated and works as client navigation, fetch previously saved static JSON payload, otherwise use your fetch logic
    const data = await process.static && process.client
      ? $axios.$get($stateURL(route))
      : $axios.$get(`/my-api/root-data/${locale}`);
    };
    commit('setRootData', data);
  }
}

// ./plugins/i18n.js
export default function (context) {
  const { store, app } = context;
  // https://nuxt-community.github.io/nuxt-i18n/callbacks.html#usage
  app.i18n.onLanguageSwitched = async (oldLocale, newLocale) => {
    await store.dispatch('getRootData', context);
  }
};
```

### Apollo & nuxt-i18n

Usage with [@nuxtjs/apollo](https://github.com/nuxt-community/apollo-module) module

```js
// ./store/index.js

import RootDataQuery from '@/apollo/queries/RootDataQuery.gql';

export const actions = {
  async nuxtServerInit({ dispatch }, context) {
    // getting some root data, e.g. header & footer
    await dispatch('getRootData', context);
  },
  getRootData({ dispatch }, context = this) {
    const {
      app, $stateURL, $axios, route,
    } = context;
    const apollo = app.apolloProvider.defaultClient;
    const { locale } = app.i18n;
    let data;
    // if generated and works as client navigation, fetch previously saved static JSON payload, otherwise use apollo query
    if (process.static && process.client) {
      const response = await fetch($stateURL(route));
      data = response.json();
    } else {
      const response = await apollo.query({
        query: RootDataQuery,
        variables: {
          locale,
        },
      });
      data = response.data;
    }
    commit('setRootData', data);
  }
}

// ./plugins/i18n.js
export default function (context) {
  const { store, app } = context;
  // https://nuxt-community.github.io/nuxt-i18n/callbacks.html#usage
  app.i18n.onLanguageSwitched = async (oldLocale, newLocale) => {
    await store.dispatch('getRootData', context);
  }
};
```

## Options

You can blacklist specific paths using `blacklist: []` options. They will be generated in native way.

## How it works

- Extracts page data during ['render:routeContext'](https://nuxtjs.org/api/internals-renderer#hooks) hook
- Writes extracted data in ['export:done'](https://nuxtjs.org/api/internals-generator#hooks) hook
- \$stateURL helper composes url: `${document.location.origin}${routerBase}${staticAssetsBase}${routePath}/${fileName}`
