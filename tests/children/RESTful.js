module.exports = function ({ ema, http200 }, { tests, test, assert }) {
    tests('RESTful', () => {
        test('RESTful.get', () => {
            const api = ema(http200({
                response ({ config }) {
                    assert.isBe(config.url, 'goods/1001?cmd=http200')
                    assert.isEqual(config.params, {
                        id: 1001, type: 'goods',
                    })
                },
                config: {
                    url: '{type}/{id}?cmd=http200',
                },
            }))

            return api.test({ type: 'goods', id: 1001 })
        })
        test('RESTful.post', () => {
            const api = ema(http200({
                response ({ config }) {
                    assert.isBe(config.url, 'goods/1001?cmd=http200')
                    assert.isBe(config.data, JSON.stringify({
                        type: 'goods', id: 1001,
                    }))
                },
                config: {
                    method: 'post',
                    url: '{type}/{id}?cmd=http200',
                },
            }))
            return api.test({ type: 'goods', id: 1001 })
        })
        test('RESTful.style-colon', () => {
            const api = ema(http200({
                response ({ config }) {
                    assert.isBe(config.url, 'goods/1001?cmd=http200')
                    assert.isBe(config.data, JSON.stringify({
                        type: 'goods', id: 1001,
                    }))
                },
                config: {
                    method: 'post',
                    url: ':type/:id?cmd=http200',
                },
            }))
            return api.test({ type: 'goods', id: 1001 })
        })
    })
}
