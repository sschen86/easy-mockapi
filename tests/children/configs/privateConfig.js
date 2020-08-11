module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('privateConfig', () => {
        test('privateConfig.headers', () => {
            const api = ema(http200({
                config: {
                    headers: { a: 1, b: 2 },
                },
                response ({ config }) {
                    assert.isBe(config.headers.a, 11)
                    assert.isBe(config.headers.b, undefined)
                    assert.isBe(config.headers.c, 22)
                },
            }))

            return api.test(null, {
                headers: { a: 11, c: 22 },
            })
        })

        test('privateConfig.timeout', () => {
            const api = ema(http999({
                config: { timeout: 189 },
            }))
            return api.test(null, { timeout: 222 }).catch((error) => {
                assert.isBe(error.message, 'timeout of 222ms exceeded')
            })
        })

        test('privateConfig.delay', () => {
            const now = Date.now()
            const api1 = ema(http200({
                success () {
                    assert.isTrue(Date.now() - now < 100)
                },
            }))
            const api2 = ema(http200({
                config: { delay: 100 },
                success () {
                    assert.isTrue(Date.now() - now >= 1000)
                },
            }))
            return Promise.all([ api1.test(), api2.test(null, { delay: 1000 }) ])
        })

        test('privateConfig.mock', () => {
            const shareMock = {
                headers: { a: 1, b: 2 },
                data: 'this is mock',
            }
            const privateMock = {
                data: 'this is private mock',
            }
            const api = ema(http200({
                config: {
                    mock () {
                        return shareMock
                    },
                },
                response (resp) {
                    assert.isEqual(resp, { data: privateMock.data, headers: {}, config: {} })
                },
            }))

            return api.test(null, {
                mock () {
                    return privateMock
                },
            })
        })

        test('privateConfig.logger', () => {
            const api = ema(http200({
                config: {
                    logger: false,
                },
                response (resp, { logger }) {
                    assert.isBe(logger, true)
                },
            }))

            return api.test(null, {
                logger: true,
            })
        })
    })
}
