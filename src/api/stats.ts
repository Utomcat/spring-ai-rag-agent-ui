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
