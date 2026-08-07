/**
 * 知识库权限接口
 */
export interface KbPermission {
    id?: number | null
    categoryId?: number
    targetType?: 'USER' | 'ROLE' | 'ALL'
    targetId?: number
    permission?: 'READ' | 'WRITE' | 'MANAGE'
    createBy?: number
    createTime?: string

    [key: string]: any
}
