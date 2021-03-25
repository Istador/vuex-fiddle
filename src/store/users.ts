import { TPromise } from './fetchID'
import fetchID from './fetchID'

export interface IUser {
  id          : number
  name        : string
  age         : number
  fetchCount  : number
  isSomething : boolean
  roles       : string[]
}

const db: { [key: number]: IUser } = {
  1: { id: 1, name: 'a', age: 18, fetchCount: 0, isSomething: true,  roles: [ 'admin', 'user' ] },
  2: { id: 2, name: 'b', age: 19, fetchCount: 0, isSomething: false, roles: [ 'admin' ] },
  3: { id: 3, name: 'c', age: 20, fetchCount: 0, isSomething: true,  roles: [ 'user' ] },
  4: { id: 4, name: 'd', age: 21, fetchCount: 0, isSomething: false, roles: [ 'user' ] },
}

const promise: TPromise<number, IUser|null> = async ({ axios, id }) =>
  axios
    .get('http://localhost:8080/')
    .then(() => {
      if (! (id in db)) { return null }
      const user = db[id]
      user.fetchCount += 1
      return Object.assign({}, user)
    })

export default function users(component: Vue) {
  return fetchID<number, IUser|null>({
    $store : component.$store,
    name   : 'users',
    promise,
  })
}
