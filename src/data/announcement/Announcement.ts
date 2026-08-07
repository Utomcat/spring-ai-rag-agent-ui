/**
 * 系统公告接口
 */
export interface Announcement {
    id?: number | null
    title?: string
    content?: string
    type?: 'INFO' | 'WARNING' | 'MAINTENANCE'
    priority?: number
    status?: 'DRAFT' | 'PUBLISHED' | 'OFFLINE'
    publishTime?: string
    expireTime?: string
    remark?: string
    createTime?: string

    [key: string]: any
}
