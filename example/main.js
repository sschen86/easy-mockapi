
import ema from '../src'

const $api = ema({
    baseURL: '', // 基础路径
    timeout: 2000, // 接口超时时间，也可以单独在config中配置某个接口的超时时间
    configs: {
        test: {
            url: '/aaa',
        },
    },
    props: {
        // 声明自定义配置项，允许在config中使用额外的字段
    },
    init (config) { // 接口初始化时
        // 可以在此处处理使用自定义的配置项，比如添加mockData字段来直接返回响应数据而非包含响应头的数据
    },
    request (data, config) { // 接口请求时拦截器
        // 预处理请求数据或者直接拦截请求返回mock数据
    },
    response (resp, config) { // 接口响应拦截器
        // 预处理响应数据，比如返回自定义的逻辑错误
    },
    success (data, config) { // 正确响应处理器
        // 数据预处理
    },
    failure (error, config) { // 错误响应处理器
        // 错误统一处理，比如登录失效等
    },
})
let a
$api.test({}, {
    abort: (abort) => {
        a = abort
    },
}).then(res => {
    console.info('res', { res })
}).catch(err => {
    console.info('err', err.message)
})
a.cancel('xx')


// import axios from 'axios'
// const CancelToken = axios.CancelToken
// const source = CancelToken.source()
// axios.get('/user/12345', {
//     cancelToken: source.token,
// }).catch(function (thrown) {
//     if (axios.isCancel(thrown)) {
//         console.log('Request canceled', thrown.message)
//     } else {
//         // 处理错误
//     }
// })
// axios.post('/user/12345', {
//     name: 'new name',
// }, {
//     cancelToken: source.token,
// })

// // 取消请求（message 参数是可选的）
// source.cancel('Operation canceled by the user.')
