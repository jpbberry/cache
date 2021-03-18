# Cache

## Installing

`npm i @jpbberry/cache`

## Usage

Cache is an extension of Discord.JS's Collection, you can find docs [here](https://discord.js.org/#/docs/collection/master/class/Collection)

Cache is essentially a temporary hold for data, that is cleared after inactivity.

You pass a `time` paramater to the constructor, which will wait that amount of time before clearing the data out of the cache. However everytime you do something with said data, like .get() it, said data's time til death with be reset, making it so you hold onto data until it is no longer actively being looked for.

## Usage

```js
const { Cache } = require('@jpbberry/cache')

const cache = new Cache(1000) // time in milliseconds

cache.set('a', 'b')

setTimeout(() => {
  console.log(cache.get('a')) // null
}, 1001)
```

But for example if you made the setTimeout 500, you would reset the time til death timer, so the cache would be available for another second.

I find this super easy in database caching implementation, where active searches are cached until they're no longer active.