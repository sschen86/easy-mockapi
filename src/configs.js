const AXIOS_GLOBAL = {
    baseURL: '',
    timeout: 5000,
    responseType: 'json',
    withCredentials: false,
    headers: { },
}

const AXIOS_SHARE = {
    url: '',
    method: 'GET',
    timeout: null,
    headers: {},
    cancelToken: null,
}

const EMA_GLOBAL = {}

const EMA_SHARE = {
    delay: 0, // 延迟响应
    mock: null, // mock响应数据，包含响应头和响应体
    mockData: null, // mock响应数据，仅响应体
    logger: null, // 控制是否打印调试日志
}

export const defaults = {
    ...AXIOS_GLOBAL,
    ...EMA_GLOBAL,
    headers: {
        ...AXIOS_GLOBAL.headers,
        ...EMA_GLOBAL.headers,
    },
}

export const globals = {
    axios: AXIOS_GLOBAL,
    ema: EMA_GLOBAL,
}
export const shares = {
    axios: AXIOS_SHARE,
    ema: EMA_SHARE,
}
