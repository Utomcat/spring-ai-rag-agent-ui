import request from '../utils/request'
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {Announcement} from "../data/announcement/Announcement";

/**
 * 获取公告分页列表
 */
export function fetchAnnouncementPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({page: params.page, size: params.size, condition: params.condition})
    return request.get('/api/announcement', {params: flatParams})
}

/**
 * 查询当前生效公告列表
 */
export function fetchActiveAnnouncements(): Promise<Result<Announcement[]>> {
    return request.get('/api/announcement/active')
}

/**
 * 新增/更新公告
 */
export function saveAnnouncement(data: Announcement): Promise<Result<void>> {
    return request.post('/api/announcement', data)
}

/**
 * 删除公告
 */
export function deleteAnnouncement(id: number): Promise<Result<void>> {
    return request.delete(`/api/announcement/${id}`)
}
