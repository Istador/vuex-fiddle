<template>
  <div id="app">
    <!-- example -->
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

    <!-- byID -->
    <div>
      <div>
        <button @click="a.refresh" v-if="toggleA">A*</button>
        <button @click="toggleA = true" v-else>A</button>
        {{ a.loading ? '...' : a.data }}
      </div>
      <div>
        <button @click="b.refresh" v-if="toggleB">B*</button>
        <button @click="toggleB = true" v-else>B</button>
        {{ b.loading ? '...' : b.data }}
      </div>
    </div>

    <!-- users -->
    <div>
      <user :id="1"/>
      <user :id="2"/>
      <user :id="7"/>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import example from './store/example'
  import byID from './store/byID'
  import User from './User.vue'

  @Component({
    components: { User }
  })
  export default class App extends Vue {
    // example
    get simple() { return example(this, false).data }
    get object() { return example(this, false) }

    // byID
    public toggleA: boolean = false
    public toggleB: boolean = true
    get a() { return byID(this, 1, this.toggleA) }
    get b() { return byID(this, 2, this.toggleB) }

    beforeDestroy() {
      this.object.unregister()
      this.a.unregister()
      this.b.unregister()
    }
  }
</script>

<style>
  * + * { margin-top: 10px; }
  body { text-align: center; }
</style>
