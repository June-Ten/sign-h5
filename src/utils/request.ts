import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { getAuthToken } from '../utils/auth'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: 'https://8u059393j1.goho.co/api/',
  timeout: 50000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config: any) => {
    // 在请求发送之前做些什么
    // 可以在这里添加 token 等请求头信息
    config.headers = {
      ...config.headers,
      'x-access-token': getAuthToken()
    } // Ensure headers object exists
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
);


// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 对响应数据做些什么
    if (response.data.code === 0) {
      return response.data.data
    } else {
      // 如果后端返回错误，可以在这里进行统一的错误处理
      throw new Error(response.data.message)
    }
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error)
  }
)

export default instance
