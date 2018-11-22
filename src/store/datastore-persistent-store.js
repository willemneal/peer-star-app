'use strict'

const DataStoreStore = require('./datastore-store')
const { encode, decode } = require('delta-crdts-msgpack-codec')

module.exports = class DataStorePersistentStore extends DataStoreStore {
  get isPersistent () {
    return true
  }

  _encode (value) {
    if (!this._cipher) {
      return super._encode(value)
    }
    return this._cipher().then((cipher) => {
      return new Promise((resolve, reject) => {
        cipher.encrypt(encode(value), (err, encrypted) => {
          if (err) {
            return reject(err)
          }
          resolve(encrypted)
        })
      })
    })
  }

  _decode (bytes, callback) {
    if (!this._cipher) {
      return super._decode(bytes, callback)
    }
    this._cipher().then((cipher) => {
      cipher.decrypt(bytes, (err, decrypted) => {
        if (err) {
          return callback(err)
        }
        const decoded = decode(decrypted)
        callback(null, decoded)
      })
    }).catch(callback)
  }
}