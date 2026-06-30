import request from '../utils/request'
import {Longin} from "../data/login/Longin";
import {Result} from "../data/result/Result";

/** 登录 */
export function login(data: Longin): Promise<Result> {
  return request.post('/api/auth/login', data)
}
