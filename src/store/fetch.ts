import axios from 'axios'
import { AxiosStatic } from 'axios'
import { Module, Store } from 'vuex'

export interface IFetchState<T> {
  [key: string] : any
  data          : T
  loading       : boolean
  initialized   : boolean
  error         : false|Error
}
export interface IFetchObject<T> {
  readonly data        : T
  readonly loading     : boolean
  readonly initialized : boolean
  readonly error       : false|Error
  refresh()            : Promise<T>
  unregister()         : void
}

type TPromise<T> = (args: { axios: AxiosStatic, state: IFetchState<T> }) => Promise<T>

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
    setter: (state, vals) => {
      for (const k in vals) {
        state[k] = vals[k]
      }
    },
  },
  actions: {
    async refresh({ commit, state }) {
      commit('setter', { loading: true })
      try {
        const data = await promise({ axios, state })
        commit('setter', {
          data        : data,
          error       : false,
          loading     : false,
          initialized : true,
        })
        return data
      }
      catch (error) {
        commit('setter', {
          error   : error,
          loading : false,
        })
        throw error
      }
    },
  },
})

export default function fetch <T> ({
  $store,
  name,
  promise,
  initial,
  initialLoad,
} : IFetchOptions<T>): IFetchObject<T> {
  const obj = {
    get data()        { return $store.state[name].data        },
    get loading()     { return $store.state[name].loading     },
    get initialized() { return $store.state[name].initialized },
    get error()       { return $store.state[name].error       },
    refresh: async () => $store.dispatch(name + '/refresh'),
    unregister: () => $store.unregisterModule(name)
  }
  if (! ($store && $store.state && name in $store.state)) {
    $store.registerModule(name, moduleConfig({ promise, initial }))
  }
  if (initialLoad && ! obj.initialized && ! obj.loading) {
    obj.refresh()
  }
  return obj
}
