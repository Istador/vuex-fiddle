import axios from 'axios'
import { Module, Store } from 'vuex'

export interface IFetchState<T> {
  [key: string] : any
  data          : T
  loading       : boolean
  initialized   : boolean
  error         : false|Error
}

type TPromise<T> = (args: { axios: any, state: IFetchState<T> }) => T

interface IFetchConfig<T> {
  promise : TPromise<T>
  initial : T
}

type TModuleConfig<T> = (config: IFetchConfig<T>) => Module<IFetchState<T>, any>

export interface IFetchOptions<T> extends IFetchConfig<T> {
  $store      : Store<any>
  name        : string
  initialLoad : boolean
}

const moduleConfig: <T>(config: IFetchConfig<T>) => Module<IFetchState<T>, any>  = ({
  promise,
  initial,
}) => ({
  namespaced: true,
  state: {
    data        : initial,
    loading     : false,
    initialized : false,
    error       : false,
  },
  mutations: {
    data        : (state, val) => state.data        = val,
    loading     : (state, val) => state.loading     = val,
    initialized : (state, val) => state.initialized = val,
    error       : (state, val) => state.error       = val,
    $multiple: (state, vals) => {
      for (const k in vals) {
        state[k] = vals[k]
      }
    },
  },
  actions: {
    async refresh({ commit, state }) {
      commit('loading', true)
      try {
        const data = await promise({ axios, state })
        commit('$multiple', {
          data        : data,
          error       : false,
          loading     : false,
          initialized : true,
        })
        return data
      }
      catch (error) {
        commit('$multiple', {
          error   : error,
          loading : false,
        })
        throw error
      }
    },
  },
  getters: {
    data        : (state) => state.data,
    loading     : (state) => state.loading,
    initialized : (state) => state.initialized,
    error       : (state) => state.error,
  },
})

export default function fetch <T> ({
  $store,
  name,
  promise,
  initial,
  initialLoad,
} : IFetchOptions<T>) {
  const obj = {
    get data()        { return $store.state[name].data        },
    get loading()     { return $store.state[name].loading     },
    get initialized() { return $store.state[name].initialized },
    get error()       { return $store.state[name].error       },
    refresh: async () => $store.dispatch(name + '/refresh'),
  }
  if (! ($store && $store.state && name in $store.state)) {
    $store.registerModule(name, moduleConfig({ promise, initial }))
    if (initialLoad && ! obj.loading) { obj.refresh() }
  }
  return obj
}