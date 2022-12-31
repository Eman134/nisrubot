module.exports = class CacheManager {
	constructor(client) {
		this.client = client
		this.connected = false
	}

	loadData() {
		this.client.redisCache = this
		this.connect().then(() => {
			this.isConnected = true
			console.log('[REDIS] Connected'.green)
		}).catch(err => {
			console.log(`[REDIS] Not connected: ${err.message}`.red)
		})

		return this
	}

	get isConnected() {
		return this.connected
	}

	set isConnected(value) {
		this.connected = value
	}

	connect() {
		return this.client.connect()
	}

	clear() {
		return this.client.flushall()
	}

	set(key, value, expiration_time) {

		if (expiration_time) {
			return this.client.set(key, value, 'EX', expiration_time)
		}
		return this.client.set(key, value)
	}

	add(key, value) {
		return this.client.add(key, value)
	}

	get(key) {
		return this.client.get(key)
	}

	delete(key) {
		return this.client.del(key)
	}

	exists(key) {
		return this.client.exists(key)
	}
}