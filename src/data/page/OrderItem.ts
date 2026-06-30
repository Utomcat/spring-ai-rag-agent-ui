/**
 * 排序项接口
 */
export interface OrderItem {
    // 需要进行排序的字段名, 和数据库相匹配
    column: string
    // 是否升序, true/false
    asc: boolean
}