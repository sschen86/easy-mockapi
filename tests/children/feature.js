module.exports = function ({ ema, http200, http999 }, { tests, test, assert }) {
    tests('feature', () => {
        test('feature.config.abort', () => {
            let abortx
            const errorMessage = '取消产生的错误'
            const sendData = { id: 'GX-001', ms: 100 }
            const privateConfig = {
                method: 'get',
                abort: (abort) => {
                    abortx = abort
                },
            }
            const api1 = ema(http200({
                response (resp, config) {
                    assert.isBe(resp.config.method, 'get')
                },
                failure (error) {
                    assert.isBe(error.message, errorMessage)
                },
            }))

            setTimeout(() => {
                abortx.cancel(errorMessage)
            }, 30)

            return Promise.all([
                api1.test(sendData, privateConfig),
            ])
        })
    })
}
