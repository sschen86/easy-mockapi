const ijest = require('ijest')
const http = require('http')
const querystring = require('querystring')

ijest({
    context: {
        ema: require('../src/').default,
        adapter: require('@smartx/adapter'),
        ...require('./httpOption'),
        ...require('fly-utils'),
    },
    tests: {
        defaultConfig: require('./children/configs/defaultConfig'),
        globalConfig: require('./children/configs/globalConfig'),
        shareConfig: require('./children/configs/shareConfig'),
        privateConfig: require('./children/configs/privateConfig'),
        apiArgs: require('./children/apiArgs'),
        handles: require('./children/handles'),
        RESTful: require('./children/RESTful'),
        example: require('./children/example'),
    },
    before (context) {
        context.ema.defaults.baseURL = 'http://localhost:4444/'

        context.server = http.createServer(function (req, res) {
            const outJSON = (data) => res.end(JSON.stringify(data == null ? {} : data))
            const params = querystring.parse(req.url.match(/^[^?]*\?(.*)/)[1])
            switch (params.cmd) {
                case 'http200': {
                    return outJSON(params)
                }
                case 'http404': {
                    res.statusCode = 404
                    return res.end()
                }
                case 'http999': {
                    return
                }
                default: {
                    console.error(`unhandle request ${JSON.stringify(params)}`)
                }
            }
        }).listen(4444)
    },
    after (context) {
        context.server.close()
    },
})
