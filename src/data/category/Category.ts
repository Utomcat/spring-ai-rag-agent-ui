/**
 * 知识库分类数据对象
 */
export interface Category{
    // 知识库分类ID
    id?: number,
    // 知识库分类名称
    name: string,
    // 知识库分类描述
    description: string,
    // 分类图标
    icon: string,
    // 分类排序序号
    sortOrder: number
}