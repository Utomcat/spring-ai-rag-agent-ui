import request from '../utils/request'
import {User} from "../data/user/User";
import {Result} from "../data/result/Result";
import {MultiResult} from "../data/result/MultiResult";
import {buildPageQuery} from "../data/page/PageParams";
import {UpdateUserProfile} from "../data/user/UpdateUserProfile.ts";
import {UpdateUserPassword} from "../data/user/UpdateUserPassword.ts";

/**
 * 获取用户分页列表
 *
 * @param params - 查询参数对象, 包含页码、每页大小、查询条件和排序项
 * @return Promise 对象, 包含分页列表数据
 */
export function fetchUserPage(params: Record<string, any>): Promise<MultiResult> {
    const flatParams = buildPageQuery({
        page: params.page,
        size: params.size,
        condition: params.condition
    })
    return request.get('/api/user/page', {params: flatParams})
}

/**
 * 创建用户
 *
 * @param data - 用户数据对象
 * @return Promise 对象, 创建结果
 */
export function saveUser(data: User): Promise<Result<void>> {
    return request.post('/api/user', data)
}

/**
 * 删除用户
 *
 * @param id - 用户ID
 * @return Promise 对象, 删除结果
 */
export function deleteUser(id: number): Promise<Result<void>> {
    return request.delete(`/api/user/${id}`)
}

/**
 * 获取当前登录用户信息
 *
 * @return Promise 对象, 包含当前登录用户信息
 */
export function fetchMe() {
    return request.get('/api/user/me')
}

/**
 * 更新当前登录用户信息
 *
 * @param data - 用户数据对象
 * @return Promise 对象, 更新结果
 */
export function updateProfile(data: UpdateUserProfile): Promise<Result<void>> {
    return request.put('/api/user/me/profile', data)
}

/**
 * 修改当前登录用户密码
 *
 * @param data - 修改密码数据对象
 * @return Promise 对象, 修改结果
 */
export function changePassword(data: UpdateUserPassword): Promise<Result<void>> {
    return request.put('/api/user/me/password', null, {
        params: {
            "oldPassword": data.oldPassword,
            "newPassword": data.newPassword
        },
    })
}

/**
 * 上传当前登录用户头像
 *
 * @param formData - 表单数据对象, 包含文件字段 file
 * @return Promise 对象, 上传结果
 */
export function uploadAvatar(formData: FormData): Promise<Result> {
    return request.post('/api/user/me/avatar', formData)
}