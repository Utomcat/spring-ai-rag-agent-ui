import request from '../utils/request'
import {Result} from "../data/result/Result";
import {Category} from "../data/category/Category";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";

/**
 * 获取知识库分类列表
 *
 * @param param - 查询参数
 * @return Promise 对象，包含知识库分类列表
 */
export function listCategories(param: Record<string, any>): Promise<MultiResult> {
    let flatParams = buildPageQuery({
        page: param.page,
        size: param.size,
        condition: param.condition,
    })
    return request.get('/api/category', { params: flatParams })
}

/**
 * 保存知识库分类
 *
 * @param data - 要保存的知识库分类数据
 * @return Promise 对象，包含保存结果
 */
export function saveCategory(data: Category) {
    return request.post('/api/category', data)
}

/**
 * 删除知识库分类
 *
 * @param id - 要删除的知识库分类 ID
 * @return Promise 对象，包含删除结果
 */
export function deleteCategory(id: number): Promise<Result<void>> {
    return request.delete(`/api/category/${id}`)
}
