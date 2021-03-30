import Collection from '@discordjs/collection'

/**
 * Collection that deletes entries after a certain amount of time
 * @extends Collection
 */
export class Cache<K, V> extends Collection<K, V> {
  /**
   * Timeout store
   */
  private readonly timeouts: Collection<any, NodeJS.Timeout> = new Collection()

  /**
   * 
   * @param time Time, in milliseconds, to delete the entry after
   * @example
   * const cache = new Cache()
   * 
   * // Set
   * cache.set('foo', 'bar') // true
   * 
   * // Get
   * cache.get('foo') // 'bar'
   * cache.get('foo2') // undefined
   * 
   * // Delete
   * cache.delete('foo') // true
   * cache.delete('foo2') // false
   */
  constructor(public readonly time: number) {
    super()

    // To ensure the cache object has a timeout
    if(!this.time) throw new Error('Instanced Cache without a timeout')
  }

  /**
   * Get
   * @param {*} key Get key
   * @example
   * // Create the cache
   * const cache = new Cache(15e3)
   * 
   * cache.get('foo') // undefined
   * 
   * cache.set('foo', 'bar') // true
   * cache.get('foo') // 'bar'
   */
  public get (key: K): V | undefined {
    if (!super.has(key)) return undefined

    this._resetTimer(key)

    return super.get(key)
  }

  /**
   * Set
   * @param {*} key Key
   * @param {*} val Value
   * @param {Function} cb Ran when item is deleted
   * @example
   * // Create the cache
   * const cache = new Cache(15e3)
   * 
   * // Set foo to bar
   * cache.set('foo', 'bar')
   */
  public set (key: K, val: V, cb?: () => void): any {
    super.set(key, val)

    this._resetTimer(key, cb)
    return true
  }

  /**
   * Delete
   * @param key Key
   * @example
   * // Create the cache
   * const cache = new Cache(15e3)
   * 
   * // Set foo to bar
   * cache.set('foo', 'bar')
   * 
   * // Delete foo
   * cache.delete('foo')
   */
  public delete(key: K): boolean {
    if (!super.has(key)) return false

    super.delete(key)

    const timeout = this.timeouts.get(key)
    if (timeout) clearTimeout(timeout)
    this.timeouts.delete(key)
    return true
  }

  /**
   * Reset the timeout for a key
   * @param key Key
   * @param cb Callback
   * 
   * @example
   * // Create the cache
   * const cache = new Cache(69420)
   * 
   * // Set foo to bar
   * cache.set('foo', 'bar')
   * 
   * // Reset the timer
   * cache._resetTimer('foo')
   */
  public _resetTimer (key: K, cb?: () => void): NodeJS.Timeout | void {
    if (this.timeouts.has(key)) return this.timeouts.get(key)?.refresh()

    this.timeouts.set(key, setTimeout(() => {
      super.delete(key)
      this.timeouts.delete(key)
      if (cb) cb()
    }, this.time))
  }
}
