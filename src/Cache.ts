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
   * cache.set('million', 'smelly') // true
   * 
   * // Get
   * cache.get('million') // 'smelly'
   * cache.get('JPBBerry') // undefined
   * 
   * // Delete
   * cache.delete('million') // true
   * cache.delete('JPBBerry') // false
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
   * cache.get('million') // undefined
   * 
   * cache.set('million', 'smelly') // true
   * cache.get('million') // 'smelly'
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
   * // MILLION smells
   * cache.set('million', 'smelly')
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
   * // Berry smells
   * cache.set('JPBBerry', 'smelly')
   * 
   * // No he doesn't
   * cache.delete('JPBBerry')
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
   * // MILLION smells
   * cache.set('million', 'smelly')
   * 
   * // Reset the timer
   * cache._resetTimer('million')
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
