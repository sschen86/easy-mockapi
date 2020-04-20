module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('defaultConfig', () => {
        test('defaultConfig.baseURL', () => {
            const api = ema(http200({
                response (resp) {
                    assert.isBe(resp.config.baseURL, 'http://localhost:4444/')
                },
            }))

            return api.test()
        })

        test('defaultConfig.timeout', () => {
            const api = ema(http999())
            return api.test().catch(error => {
                assert.isBe(error.message, 'timeout of 5000ms exceeded')
            })
        }, 10000)

        test('defaultConfig.withCredentials', () => {
            const api = ema(http200({
                response ({ config }) {
                    assert.isBe(config.withCredentials, false)
                },
            }))
            return api.test()
        })

        test('defaultConfig.responseType', () => {
            const api = ema(http200({
                response ({ config }) {
                    assert.isBe(config.responseType, 'json')
                },
            }))
            return api.test()
        })
    })
}
