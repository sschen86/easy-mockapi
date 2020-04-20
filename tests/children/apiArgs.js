module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('apiArgs', () => {
        test('apiArgs(data)', () => {
            const data = { id: 'GX-001', type: 2 }
            const api1 = ema(http200({
                response ({ config }) {
                    assert.isEqual(config.params, data)
                },
            }))
            const api2 = ema(http200({
                config: {
                    method: 'post',
                },
                response ({ config }) {
                    assert.isEqual(config.data, JSON.stringify(data))
                },
            }))

            return Promise.all([ api1.test(data), api2.test(data) ])
        })

        test('apiArgs(data, config)', () => {
            const data = { id: 'GX-001', type: 2 }
            const api = ema(http200({
                response ({ config }) {
                    assert.isEqual(config.params, data)
                    assert.isBe(config.headers.a, 1)
                },
            }))

            return api.test(data, { headers: { a: 1 } })
        })

        test('apiArgs(data, callback)', () => {
            const sendData = { id: 'GX-001' }
            const api = ema(http200({
                response ({ config }) {
                    assert.isEqual(config.params, sendData)
                },
            }))
            return new Promise(resolve => {
                api.test(sendData, function (data, error) {
                    assert.isObject(data)
                    assert.isNull(error)
                    resolve()
                })
            })
        })

        test('apiArgs(data, callback, config)', () => {
            const data = { id: 'GX-001' }
            const api = ema(http200({
                response ({ config }) {
                    assert.isEqual(config.params, data)
                    assert.isBe(config.headers.a, 'abc')
                },
            }))
            return new Promise(resolve => {
                api.test(data, function (data, error) {
                    assert.isObject(data)
                    assert.isNull(error)
                    resolve()
                }, { headers: { a: 'abc' } })
            })
        })

        test('apiArgs(callback)', () => {
            const api1 = ema(http200())
            const api2 = ema(http999({
                timeout: 10,
            }))

            return Promise.all([
                new Promise(resolve => {
                    api1.test(function (data, error) {
                        assert.isObject(data)
                        assert.isNull(error)
                        resolve()
                    })
                }),
                new Promise(resolve => {
                    api2.test(function (data, error) {
                        assert.isNull(data)
                        assert.isObject(error)
                        resolve()
                    })
                }),
            ])
        })

        test('apiArgs(callback, config)', () => {
            const api = ema(http200({
                config: { delay: 1000 },
                response ({ config }) {
                    assert.isBe(config.headers.a, 'io')
                },
            }))

            return new Promise(resolve => {
                api.test(function (data, error) {
                    assert.isObject(data)
                    assert.isNull(error)
                    resolve()
                }, { headers: { a: 'io' } })
            })
        })
    })
}
