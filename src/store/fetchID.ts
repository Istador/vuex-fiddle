import axios from 'axios'
import { AxiosStatic } from 'axios'
import { Module, Store } from 'vuex'
import Vue from 'vue'

type IDType = number | string

export interface IFetchState<ID extends IDType, T> {
  [key: string] : any
  id            : ID
  data          : T|null
  loading       : boolean
  initialized   : boolean
  error         : false|Error
}

export interface IFetchObject<ID extends IDType, T> {
  readonly id          : ID
  readonly data        : T|null
  readonly loading     : boolean
  readonly initialized : boolean
  readonly error       : false|Error
  refresh()            : Promise<T>
}

export interface IFetchComponent<ID extends IDType, T> {
  find(id: ID)      : IFetchObject<ID, T>
  findAsync(id: ID) : Promise<T>
  unregister()      : void
}

export type TPromise<ID extends IDType, T> = (args: { axios: AxiosStatic, id: ID }) => Promise<T>

interface IFetchConfig<ID extends IDType, T> {
  promise : TPromise<ID, T>
}

type TModuleState<ID extends IDType, T>  = { [key in ID]: IFetchState<ID, T> }
type TModule<ID extends IDType, T>       = Module<TModuleState<ID, T>, any>
type TModuleConfig<ID extends IDType, T> = (config: IFetchConfig<ID, T>) => TModule<ID, T>

export interface IFetchOptions<ID extends IDType, T> extends IFetchConfig<ID, T> {
  $store : Store<any>
  name   : string
}

function moduleConfig <ID extends IDType, T> (
  { promise }: IFetchConfig<ID, T>
): TModule<ID, T>
{ return ({
  namespaced: true,
  state: ({} as TModuleState<ID, T>),
  mutations: {
    loading(state: TModuleState<ID, T>, id: ID) {
      if (id in state) {
        state[id].loading = true
      }
      else {
        state[id] = {
          id          : id,
          data        : null,
          loading     : true,
          initialized : false,
          error       : false,
        }
      }
    },
    loaded(state: TModuleState<ID, T>, { id, data }: { id: ID, data: T }) {
      // state[id].data        = data
      Vue.set(state[id], 'data', data)
      state[id].loading     = false
      state[id].initialized = true
      state[id].error       = false
    },
    failed(state: TModuleState<ID, T>, { id, error }: { id: ID, error: Error }) {
      state[id].loading = false
      state[id].error   = error
    },
  },
  actions: {
    async load({ commit }, id: ID) {
      commit('loading', id)
      try {
        const data = await promise({ axios, id })
        commit('loaded', { id, data })
        return data
      }
      catch (error) {
        commit('failed', { id, error })
        throw error
      }
    },
  },
})}

export default function fetch <ID extends IDType, T> ({
  $store,
  name,
  promise,
} : IFetchOptions<ID,T>): IFetchComponent<ID, T> {
  const findAsync: (id: ID) => Promise<T> = async (id) => $store.dispatch(name + '/load', id)
  const find: (id: ID) => IFetchObject<ID, T> = (id) => {
    const refresh = () => findAsync(id)
    let obj = $store.state[name][id]
    if (! obj || (! obj.initialized && ! obj.loading)) {
      refresh()
      obj = $store.state[name][id]
    }
    obj.refresh = refresh
    return obj
  }

  if (! ($store && $store.state && name in $store.state)) {
    $store.registerModule(name, moduleConfig({ promise }))
  }
  return {
    find,
    findAsync,
    unregister : () => $store.unregisterModule(name)
  }
}
