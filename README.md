# easy-mockapi
前端开发API系统，支持数据适配器，mock生成器，支持RESTFul方式接口，可以普遍在vue或者react的api相关模块中使用

### 开发目的
+ 解决前端接口管理维护的问题
+ 解决前端接口调试困难的问题
+ 解决前端接口数据mock的问题
+ 解决前端接口前后端字段不统一的问题


### 组件特点

+ 以配置文件的方式实现接口的定义
+ 以声明的方式实现动态mock数据的生成
+ 支持自定义的扩展配置项实现复杂的功能
+ 支持promise和callback模式无缝使用
+ 支持完整的调试信息输出
+ 支持前后端数据快速适配


### 配置说明

#### 应用中使用接口获取数据

```js
// promise模式
$api.getData({ id:1 })
    .then((data, res) => {
        // data包含返回的数据，res包含完整的数据，比如请求头
        // 处理数据
    })
    .catch(err => {
        // 处理异常
    })

// callback模式
$api.getData({ id:1 }, (data, err, res) => {
    if(err){
        // 错误处理
    }
    // data
    // res 
})
```

#### 接口配置项

```js
const configs = {}

// 以配置项的key作为接口调用的名称
configs.getData = {
    method:'get', // 请求方式，默认get
    url: '/data/:id', // 接口地址
    mock (params, header){
        // params 请求的参数
        // header 请求头
        return {
            data: {
                // 响应的数据
            },
            header: {
                // 响应头
            }
        }
    },
    delay: 1000, // 模拟延迟1000ms
    reqa: {
        // 请求适配器
    },
    resa: {
        // 响应适配器
    }
}
```

#### 组件安装配置

```
npm install easy-mockapi -S
```

```js
import ema from 'easy-mockapi'

const $api = ema({
    baseURL: '', // 基础路径
    timeout: 2000, // 接口超时时间，也可以单独在config中配置某个接口的超时时间
    configs: {
        // 接口配置项
    },
    props: {
        // 声明自定义配置项，允许在config中使用额外的字段
    },
    init(config){ // 接口初始化时
        // 可以在此处处理使用自定义的配置项，比如添加mockData字段来直接返回响应数据而非包含响应头的数据
    },
    request (data, config) { // 接口请求时拦截器
       // 预处理请求数据或者直接拦截请求返回mock数据
    },
    response(resp, config){ // 接口响应拦截器
        // 预处理响应数据，比如返回自定义的逻辑错误
    },
    success (data, config) { // 正确响应处理器
        // 数据预处理
    },
    failure(error, config){ // 错误响应处理器
        // 错误统一处理，比如登录失效等
    }
})


```


### 示例
```js
const { object } = require('fly-utils')
const adapter = require('@smartx/adapter')
const dpp = require('dpp')
const request = ema({
    apis: {
        // 接口配置项
    },
    baseURL: '',
    timeout: 2000,
    customConfigs: {
        reqa (value, valueType) { // 请求参数适配器
            if (valueType === 'function') {
                return value
            }
            if (valueType === 'object') {
                return adapter(value).input
            }
        },
        resa (value, valueType) { // 响应数据适配器
            if (valueType === 'function') {
                return value
            }
            if (valueType === 'object') {
                return adapter(value).input
            }
        },
        preventDefaultError: true,
        disabledCatch: true,
    },
    request (data, config) {
        if (config.reqa) {
            object.emptyAssign(data, config.reqa(data))
        }
    },
    response (resp, config) {
        const { data } = resp
        const { code } = data

        if (code === 1008) {
            throw Error('NO-LOGIN')
        }

        if (code !== 0) {
            throw Error(data.message)
        }
        // 业务数据是放在响应数据的data字段下的，这样处理让success直接使用业务数据
        resp.data = resp.data.data
    },
    success (data, config) {
        if (config.resa) {
            object.emptyAssgin(data, config.resa(data))
        }
    },
    failure (error, config) {
        if (config.preventDefaultError) {
            return
        }
        if (error.message === 'NO-LOGIN') {
            return alert('登录失效')
        }
        alert(error.message)
    },
})


```