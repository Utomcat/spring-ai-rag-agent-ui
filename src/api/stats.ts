import {Stats} from "../data/stats/Stats.ts";
import request from '../utils/request'

/**
 * 获取统计数据
 *
 * @return Promise 响应数据
 */
export function fetchOverview(): Promise<Stats> {
  return request.get('/api/stats/overview')
}

/**
 * 获取近 7 天检索指标
 */
export function fetchRetrieval(): Promise<any> {
  return request.get('/api/stats/retrieval')
}

/**
 * 获取近 7 天成本看板
 */
export function fetchCost(): Promise<any> {
  return request.get('/api/stats/cost')
}
