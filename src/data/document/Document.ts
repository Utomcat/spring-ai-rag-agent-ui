/**
 * 文档数据接口
 */
export interface Document{
    // 文档ID
    id?: number,
    // 分类ID
    categoryId?: number,
    // 文档标题
    title?: string,
    // 文档名称
    fileName?: string,
    // 文档相对路径
    filePath?: string,
    // 文档类型
    fileType?: string,
    // 文档大小
    fileSize?: number,
    // 文档上传状态
    status?: string,
    // 文档向量数量
    vectorCount?: number,
    // 文档上传用户 ID
    uploadUserId?: number,
}