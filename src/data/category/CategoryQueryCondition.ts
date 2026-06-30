/**
 * 知识库分类查询条件接口
 */
export interface CategoryQueryCondition{
    // 知识库分类名称
    name?: string,
    // 知识库分类描述
    description?: string,
    // 分类图标
    icon?: string,
    // 排序序号
    sortOrder?: number
}