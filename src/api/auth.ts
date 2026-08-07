import request from '../utils/request'
import {Longin} from "../data/login/Longin";
import {Result} from "../data/result/Result";

/** 登录 */
export function login(data: Longin): Promise<Result> {
  return request.post('/api/auth/login', data)
}

/**
 * 刷新 access token
 */
export function refreshToken(refreshToken: string): Promise<Result> {
  return request.post('/api/auth/refresh', {refreshToken})
}

/**
 * 安全退出（撤销 refresh token）
 */
export function logout(): Promise<Result<void>> {
  return request.post('/api/auth/logout')
}
