const AXIOS_GLOBAL = {
    baseURL: '',
    timeout: 5000,
    responseType: 'json',
    withCredentials: false,
    headers: { },
}

const AXIOS_SHARE = {
    url: '',
    method: 'get',
    timeout: null,
    headers: {},
}

const EMA_GLOBAL = {}

const EMA_SHARE = {
    delay: 0, // 延迟响应
    mock: null, // mock响应数据，包含响应头和响应体
    mockData: null, // mock响应数据，仅响应体
}

module.exports = {
    defaults: {
        ...AXIOS_GLOBAL,
        ...EMA_GLOBAL,
        headers: {
            ...AXIOS_GLOBAL.headers,
            ...EMA_GLOBAL.headers,
        },
    },
    globals: {
        axios: AXIOS_GLOBAL,
        ema: EMA_GLOBAL,
    },
    shares: {
        axios: AXIOS_SHARE,
        ema: EMA_SHARE,
    },
}
