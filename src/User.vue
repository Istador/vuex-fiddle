<template>
  <div class="user" :class="{ 'loading': fetch.loading }">
    <span v-if="user">User({{ user.id }}, {{ user.name }})@{{ user.fetchCount }}</span>
    <span v-else-if="! fetch">???</span>
    <span v-else-if="fetch.loading">...</span>
    <span v-else>missing</span>

    <button v-if="fetch.loading">...</button>
    <button v-else @click="fetch.refresh" >refresh</button>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import { IUser } from './store/users'
  import users from './store/users'

  @Component
  export default class User extends Vue {
    @Prop({ type: Number, required: true }) readonly id!: number
    fetch = users(this).find(this.id)
    get user(): IUser|null { return this.fetch.data  }
  }
</script>

<style>
  .user > button { margin-left: 5px; }
  .user.loading { opacity: 0.5; }
</style>
