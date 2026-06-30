/**
 * 用户信息接口
 */
export interface User {
    id?: number | null
    username?: string
    password?: string
    realName?: string
    role?: 'USER' | 'ADMIN'
    status?: number
    createTime?: string

    [key: string]: any
}