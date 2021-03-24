<template>
  <div id="app">
    <button @click="object.refresh" v-if="object.initialized">add</button>
    <button @click="object.refresh" v-else>load</button>
    <div>
      <div>
        Object:
        <div>Initialized: {{ object.initialized }}</div>
        <div>Loading: {{ object.loading }}</div>
        <div>Error: {{ object.error && object.error.message }}</div>
        <div>Data: {{ object.data }}</div>
      </div>
    </div>
    <div>Simple: {{ simple }}</div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import example from './store/example'
  @Component
  export default class App extends Vue {
    get simple() { return example(this, false).data }
    get object() { return example(this, false) }
  }
</script>

<style>
  * + * { margin-top: 10px; }
  body { text-align: center; }
</style>
