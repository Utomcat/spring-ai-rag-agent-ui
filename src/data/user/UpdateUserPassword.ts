/**
 * 修改密码参数接口
 */
export interface UpdateUserPassword{
    // 旧密码 - 原文
    oldPassword?: string,
    // 新密码 - 原文
    newPassword?: string
}