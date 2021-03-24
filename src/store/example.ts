import Vue from 'vue'

import fetch from './fetch'

let n: number = 0

export default function example (component: Vue, initialLoad: boolean = true) {
  return fetch<number[]>({
    $store      : component.$store,
    name        : 'fetch/example',
    initial     : [],
    initialLoad : initialLoad,
    promise: ({ axios, state }) =>
      axios
        .get('http://localhost:8080/')
        .then(() => [ ...(state.data), ++n ])
  })
}
