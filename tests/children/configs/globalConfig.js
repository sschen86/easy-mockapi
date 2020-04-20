module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('globalConfig', () => {
        test('globalConfig.apis', () => {
            const api = ema({
                configs: {
                    test1: {
                        url: '?cmd=http200&id=test1',
                    },
                    test2: {
                        url: '?cmd=http200&id=test2',
                    },
                    group1: {
                        test3: {
                            url: '?cmd=http200&id=test3',
                        },
                        test4: {
                            url: '?cmd=http200&id=test4',
                        },
                    },
                    group2: {
                        test5: {
                            url: '?cmd=http200&id=test5',
                        },
                    },
                },
            })

            return Promise.all('12345'.split('').map(i => {
                const name = `test${i}`
                return api[name]().then(data => {
                    assert.isBe(data.id, name)
                })
            }))
        })

        test('globalConfig.baseURL', () => {
            const api = ema(http200({
                baseURL: 'http://localhost:4444/abc/',
                response (resp) {
                    assert.isBe(resp.config.baseURL, 'http://localhost:4444/abc/')
                },
            }))
            return api.test()
        })

        test('globalConfig.timeout', () => {
            const api = ema(http999({
                timeout: 100,
            }))

            return api.test().catch(error => {
                assert.isBe(error.message, 'timeout of 100ms exceeded')
            })
        })

        test('globalConfig.withCredentials', () => {
            const api = ema(http200({
                withCredentials: true,
                response (resp) {
                    assert.isBe(resp.config.withCredentials, true)
                },
            }))
            return api.test()
        })

        test('globalConfig.responseType', () => {
            const api = ema(http200({
                responseType: 'text',
                response (resp) {
                    assert.isBe(resp.config.responseType, 'text')
                },
            }))
            return api.test()
        })

        test('globalConfig.env', () => {
            const api1 = ema(http200({
                config: {
                    mock () {
                        return {}
                    },
                },
                response (resp, config) {
                    assert.isFunction(config.mock)
                },
            }))
            const api2 = ema(http200({
                env: 'production',
                config: {
                    mock () {
                        return {}
                    },
                },
                response (resp, config) {
                    assert.isUndefined(config.mock)
                },
            }))
            return Promise.all([ api1.test(), api2.test() ])
        })

        test('globalConfig.customConfigs', () => {
            const getter = (value, valueType, sourceType) => {
                if (Array.isArray(value)) {
                    return
                }
                if (value === true) {
                    return 'true'
                }
                if (value === false) {
                    return 'false'
                }
                if (sourceType === 'private') {
                    return '#private'
                }
                if (sourceType === 'share') {
                    return {
                        type: 'share',
                        value,
                    }
                }
            }
            const api = ema(http200({
                props: {
                    a: true,
                    b: [ Boolean ],
                    c: { defaultValue: 666 },
                    d: { defaultValue: 666 },
                    e: getter,
                    f: getter,
                    g: getter,
                    h: getter,
                    kkk: getter,
                },
                response (resp, config) {
                    assert.isBe(config.a, '123')
                    assert.isBe(config.b, false)
                    assert.isBe(config.c, 666)
                    assert.isBe(config.d, 888)
                    assert.isBe(config.e, 'true')
                    assert.isBe(config.f, 'false')
                    assert.isBe(config.g, undefined)
                    assert.isBe(config.kkk, '#private')
                    assert.isEqual(config.h, { type: 'share', value: 'hello' })
                },

                config: {
                    a: '123',
                    b: false,
                    c: null,
                    d: 888,
                    e: true,
                    f: false,
                    g: [],
                    h: 'hello',
                },
            }))

            return api.test(null, { kkk: 'xxx' })
        })
    })
}
