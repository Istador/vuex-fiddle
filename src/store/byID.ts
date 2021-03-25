import Vue from 'vue'

import fetch from './fetch'

export default function byID (component: Vue, id: number, initialLoad = true) {
  return fetch<number|undefined>({
    $store      : component.$store,
    name        : 'fetch/byID/' + id,
    initial     : undefined,
    initialLoad : initialLoad,
    promise: ({ axios }) =>
      axios
        .get('http://localhost:8080/')
        .then(() => { return id })
  })
}
