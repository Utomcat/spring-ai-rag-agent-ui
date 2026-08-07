/**
 * AI 模型配置接口
 */
export interface AiModelConfig {
    id?: number | null
    modelName?: string
    provider?: 'OLLAMA' | 'DASHSCOPE' | 'OPENAI' | 'AZURE'
    baseUrl?: string
    modelType?: 'CHAT' | 'EMBEDDING' | 'IMAGE'
    inputPricePer1k?: number
    outputPricePer1k?: number
    maxTokens?: number
    isDefault?: number
    status?: number
    remark?: string
    createTime?: string

    [key: string]: any
}
