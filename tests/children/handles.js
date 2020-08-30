module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('handles', () => {
        test('handles.request(data, config)', () => {
            const sendData = { id: 'GX-001' }
            const privateConfig = { method: 'post' }
            const api1 = ema(http200({
                request (data, config) {
                    assert.isEqual(data, sendData)
                    assert.isBe(config.method, privateConfig.method)

                    data.id = 'GX-002'
                    config.method = 'get'
                },
                response (resp, config) {
                    assert.isBe(resp.config.method, 'get')
                    assert.isBe(resp.config.params.id, 'GX-002')
                    assert.isBe(config.method, 'get')
                },
            }))
            const api2 = ema(http200({
                request (data, config) {
                    return {
                        data: { id: 'GX-002' },
                        config: {
                            ...config,
                            method: 'get',
                            timeout: 12345,
                        },
                    }
                },
                response ({ config }) {
                    assert.isBe(config.method, 'get')
                    assert.isBe(config.params.id, 'GX-002')
                    assert.isBe(config.timeout, 12345)
                },
            }))

            return Promise.all([
                api1.test(sendData, privateConfig),
                api2.test(sendData, privateConfig),
            ])
        })

        test('handles.response(resp, config)', () => {
            const api = ema(http200({
                response (resp, config) {
                    assert.isObject(resp)
                    assert.isObject(resp.config)
                    assert.isObject(resp.headers)
                    assert.isObject(config)
                    assert.isString(config.method)

                    resp.data = { a: 1 }
                },
                success (data) {
                    assert.isEqual(data, { a: 1 })
                },
            }))

            return Promise.all([
                api.test(),
                api.test(null, {
                    mock () {
                        return {
                            data: {},
                        }
                    },
                }),
            ])
        })

        test('handles.success(data, config)', () => {
            const api = ema(http200({
                success (data, config) {
                    assert.isObject(data)
                    assert.isBe(data.cmd, 'http200')
                    assert.isObject(config)
                    return { a: 1 }
                },
            }))

            return api.test().then((data) => {
                assert.isEqual(data, { a: 1 })
            })
        })

        test('handles.failure(error, config)', () => {
            const api1 = ema(http200({
                response () {
                    throw Error('xxx')
                },
                failure (error, config) {
                    assert.isObject(error)
                    assert.isObject(config)
                    assert.isBe(error.message, 'xxx')
                    throw new Error('xyz')
                },
            }))

            const api2 = ema(http999({
                timeout: 123,
                failure (error, config) {
                    assert.isObject(error)
                    assert.isObject(config)
                    throw error
                },
            }))

            return Promise.all([
                api1.test().catch(error => {
                    assert.isObject(error)
                    assert.isBe(error.message, 'xyz')
                }),
                api2.test().catch(error => {
                    assert.isObject(error)
                    assert.isBe(error.message, 'timeout of 123ms exceeded')
                }),
            ])
        })
    })
}
