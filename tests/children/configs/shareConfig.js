module.exports = function ({ ema, http200, http000, http999 }, { tests, test, assert }) {
    tests('shareConfig', () => {
        test('shareConfig.url', () => {
            const api = ema(http200({
                config: {
                    url: '?cmd=http200&seturl=1',
                },
                response ({ config }) {
                    assert.isMatch(config.url, /\?cmd=http200&seturl=1$/)
                },
            }))
            return api.test()
        })

        test('shareConfig.method', () => {
            const pps = [ 'get', 'post', 'put', 'delete', 'patch' ].map(method => {
                return ema(http200({
                    config: { method },
                    response ({ config }) {
                        assert.isBe(config.method, method)
                    },
                }))
            })
            return Promise.all(pps)
        })

        test('shareConfig.headers', () => {
            const api = ema(http200({
                config: {
                    headers: { a: 1, b: 2 },
                },
                response ({ config }) {
                    assert.isBe(config.headers.a, 1)
                    assert.isBe(config.headers.b, 2)
                },
            }))

            return api.test(null)
        })

        test('shareConfig.timeout', () => {
            const api = ema(http999({
                config: { timeout: 189 },
            }))
            return api.test().then().catch((error) => {
                assert.isBe(error.message, 'timeout of 189ms exceeded')
            })
        })

        test('shareConfig.delay', () => {
            const now = Date.now()
            const api1 = ema(http200({
                success () {
                    assert.isTrue(Date.now() - now < 100)
                },
            }))
            const api2 = ema(http200({
                config: { delay: 2000 },
                success () {
                    assert.isTrue(Date.now() - now >= 2000)
                },
            }))
            return Promise.all([ api1.test(), api2.test() ])
        })

        test('shareConfig.mock', () => {
            const mock = {
                headers: { a: 1, b: 2 },
                data: 'this is mock',
            }
            const api = ema(http200({
                config: {
                    mock () {
                        return mock
                    },
                },
                response (resp, config) {
                    assert.isObject(resp)
                    assert.isEqual(resp.data, mock.data)
                    assert.isEqual(resp.headers, mock.headers)
                },
            }))

            return api.test()
        })

        test('shareConfig.mockData', () => {
            const mockData = { a: 123 }
            const api = ema(http200({
                response ({ data }) {
                    assert.isEqual(data, mockData)
                },
                config: {
                    mockData () {
                        return mockData
                    },
                },
            }))

            return api.test()
        })
    })
}
