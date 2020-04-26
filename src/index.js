
import axios from 'axios'
import { defaults, globals, shares } from './configs'
const acceptConfigKeys = Object.keys(shares.axios).concat(Object.keys(shares.ema))

export default apiFactory

apiFactory.defaults = defaults

function apiFactory (option) {
    return (new EasyMockapi(option)).exports
}

class EasyMockapi {
    constructor (option) {
        const {
            // 是否开发环境
            env = 'development',
            logger = false,

            // 拦截器钩子
            init,
            request,
            response,
            success,
            failure,

            // axios配置项
            baseURL = defaults.baseURL,
            timeout = defaults.timeout,
            withCredentials = defaults.withCredentials,
            responseType = defaults.responseType,

            // 自定义配置项
            props = {},

            // 接口配置项
            configs = {},
        } = option

        this._envIsDevelopment = env === 'development'
        this._logger = logger
        this._handles = { init, request, response, success, failure }
        this._axios = axios.create(Object.assign({}, globals.axios, {
            baseURL, timeout, withCredentials, responseType,
        }))

        this._props = this._formatProps(props)
        this.exports = this._createExports(configs)
    }

    _formatProps (props) {
        if (this._envIsDevelopment) {
            // 开发模式下对配置项进行校验
        }

        // 暂时不进行转化，后续支持其他格式的功能
        return props

        /*
        四种模式的自定义配置项定义
        const props = {
            a: true, // 配置项是任意类型
            b: [ Boolean, String ], // 配置项必须是数组中的类型
            c: { // 配置项有类型和默认值
                type: String,
                default: 'xxx',
            },
            d: function (value, valueType, sourceType) { // 配置项通过拦截器返回
                return value
            }, // sourceType === 'share, private'
        }
        */
    }

    _createExports (configs) {
        const allConfigs = {}
        const groupConfigsUnique = {}
        const pushConfig = (apiName, apiConfig, groupName) => {
            // 对配置项做重复，完整性校验
            if (this._envIsDevelopment) {
                if (apiName in groupConfigsUnique) {
                    groupName = groupConfigsUnique[apiName]
                    return console.error(`注册服务${groupName}.${apiName}失败，存在同名服务${groupName}.${apiName}`)
                }

                if (apiName in allConfigs) {
                    return console.error(`注册服务${groupName}.${apiName}失败，存在同名服务${apiName}`)
                }

                // 配置项做字段校验
                if (apiConfig.mock && typeof apiConfig.mock !== 'function') {
                    return console.error(`注册服务${groupName}.${apiName}失败，mock配置项必须为Function`)
                }
            }

            allConfigs[apiName] = apiConfig
            if (groupName) {
                groupConfigsUnique[apiName] = groupName
            }
        }

        Object.keys(configs).forEach(key => {
            const config = configs[key]
            if (!config || typeof config !== 'object') {
                return
            }

            if (typeof config.url === 'string') {
                return pushConfig(key, config)
            }
            const childConfigs = config
            const groupName = key
            Object.keys(childConfigs).forEach(apiName => {
                const config = childConfigs[apiName]
                if (!config || typeof config !== 'object') {
                    return
                }

                if (typeof config.url === 'string') {
                    return pushConfig(apiName, config, groupName)
                }
                throw Error(`配置项必须包含url：${groupName}.${apiName}`)
            })
        })

        return new Proxy({}, {
            get: (configs, key) => {
                if (!allConfigs[key]) {
                    return
                }

                return (...args) => this._request(allConfigs[key], ...args)
            },
        })
    }

    _request (shareConfig, sendData, callback, privateConfig) {
        // sendData, callback
        // sendData, callback, privateConfig
        // sendData, privateConfig
        // sendData

        // 由参数callback是否传入决定是callback模式还是Promise模式

        // 仅传了配置项
        if (sendData == null && typeof callback === 'object') {
            privateConfig = callback
            callback = null
            sendData = null
        } else if (typeof sendData === 'function') { // 无sendData参数
            privateConfig = callback
            callback = sendData
            sendData = null
        } else if (typeof callback !== 'function') { // 不传callback，那么属于Promise模式
            privateConfig = callback
            callback = null
        }

        sendData = sendData || {}
        callback = callback || null
        privateConfig = privateConfig || {}

        const data = sendData // 发生的数据，根据methods的方式设置到不同的地方
        const config = this._createConfig(shareConfig, privateConfig) // 当前请求实例的配置项
        let requestOption = { data, config }
        config.data = data

        // 请求拦截器中进行处理
        if (this._handles.request) {
            requestOption = this._getNewValue(requestOption, this._handles.request(data, config))
            config.data = requestOption.data
        }

        this._convertRESTful(config)

        const asyncResult = (config.mock || config.mockData) ? this._mockResponse(requestOption) : this._httpResponse(requestOption)

        if (!callback) {
            return asyncResult
        }

        asyncResult
            .then((responseData) => {
                callback(responseData, null)
            })
            .catch((error) => {
                callback(null, error)
            })
    }

    _createConfig (shareConfig, privateConfig) {
        const config = {}
        // 加入axios默认配置项
        for (const key in shares.axios) {
            if (shares.axios[key] != null) {
                config[key] = shares.axios[key]
            }
        }
        // 加入ema默认配置项
        for (const key in shares.ema) {
            if (shares.ema[key] != null) {
                config[key] = shares.ema[key]
            }
        }
        // 加入共享配置项
        for (const key in shareConfig) {
            if (acceptConfigKeys.includes(key)) {
                config[key] = shareConfig[key]
            } else {
                this._tryAddProp(config, key, shareConfig[key], 'share')
            }
        }

        // 加入私有配置项
        for (const key in privateConfig) {
            if (acceptConfigKeys.includes(key)) {
                config[key] = privateConfig[key]
            } else {
                this._tryAddProp(config, key, privateConfig[key], 'private')
            }
        }

        // 非开发模式下关闭mock
        if (!this._envIsDevelopment) {
            delete config.mock
            delete config.mockData
        }

        return config
    }

    _mockResponse (requestOption) {
        const { config, data } = requestOption
        try {
            let asyncResponseObject
            if (config.mock) {
                const responseObject = config.mock({ data, headers: config.headers })
                asyncResponseObject = new Promise((resolve, reject) => {
                    if (isPromise(responseObject)) {
                        responseObject.then((responseObject) => {
                            resolve({ data: responseObject.data, headers: responseObject.headers || {}, config: {} })
                        }).catch(reject)
                    } else {
                        resolve({ data: responseObject.data, headers: responseObject.headers || {}, config: {} })
                    }
                })
            } else {
                // mockData
                const responseData = config.mockData({ data, headers: config.headers })
                asyncResponseObject = new Promise((resolve, reject) => {
                    if (isPromise(responseData)) {
                        responseData.then((data) => {
                            resolve({ data, headers: {}, config: {} })
                        }).catch(reject)
                    } else {
                        resolve({ data: responseData, headers: {}, config: {} })
                    }
                })
            }
            return this._onResponse(asyncResponseObject, config)
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error)
            })
        }


        function isPromise (data) {
            return typeof data === 'object' && typeof data.then === 'function'
        }
    }

    _httpResponse (requestOption) {
        const { config, data } = requestOption
        const axiosConfig = Object
            .keys(config)
            .filter(key => key in shares.axios)
            .reduce((axiosConfig, key) => (axiosConfig[key] = config[key], axiosConfig), {})

        if (/^(GET)$/i.test(config.method)) {
            axiosConfig.params = data
        } else {
            axiosConfig.data = data
        }

        return this._onResponse(this._axios(axiosConfig), config)
    }

    _onResponse (asyncResponseObject, config) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                asyncResponseObject
                    .then(responseObject => {
                        if (this._handles.response) {
                            responseObject = this._getNewValue(responseObject, this._handles.response(responseObject, config))
                        }
                        if (this._handles.success) {
                            responseObject.data = this._getNewValue(responseObject.data, this._handles.success(responseObject.data, config))
                        }

                        if (this._envIsDevelopment && this._logger) {
                            console.warn('=== ema.response ===\n', { responseObject, config })
                        }
                        resolve(responseObject.data)
                    })
                    .catch(error => {
                        if (this._handles.failure) {
                            error = this._getNewValue(error, this._handles.failure(error, config))
                        }

                        if (this._envIsDevelopment && this._logger) {
                            console.warn('=== ema.error ===\n', { error, config })
                        }
                        reject(error)
                    })
            }, config.delay || 0)
        })
    }

    _getNewValue (oldValue, newValue) {
        return newValue !== undefined ? newValue : oldValue
    }

    _tryAddProp (config, key, value, sourceType) {
        const valueType = typeof value
        const prop = this._props[key]

        if (!prop) {
            return
        }

        // 配置项为true，则无脑插入配置项
        if (prop === true) {
            return config[key] = value
        }

        // 配置项为数组，则判断类型是否符合，符合则插入
        if (Array.isArray(prop)) {
            const types = prop
            if (value != null && types.includes(value.constructor)) {
                config[key] = value
            }
            return
        }

        // 配置项为一个prop，则使用内置的项分别处理
        if (typeof prop === 'object') {
            const { types, defaultValue } = prop

            // 类型判断
            if (types) {
                if (!value || types.includes(value.constructor)) {
                    return
                }
            }

            if (value != null) {
                config[key] = value
                return
            }

            if (defaultValue != null) {
                config[key] = defaultValue
            }
            return
        }

        // 函数拦截器
        if (typeof prop === 'function') {
            const newValue = prop(value, valueType, sourceType)
            if (newValue != null) {
                config[key] = newValue
            }
        }
    }

    _convertRESTful (config) {
        const { url, data } = config
        if (!/\{\w+\}/.test(url)) {
            return
        }
        config.url = url.replace(/\{(\w+)\}/g, (match, key) => {
            if (key in data) {
                return data[key]
            }
            return match
        })
    }
}
