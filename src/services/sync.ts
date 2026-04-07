import axios from 'axios';
import { type ModelInfo } from '../types/index.js';

export class MozartSyncService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.MOZART_SERVER_API_URL || 'https://api-dev.mozart.la';
    }

    async deleteModel(provider: string, modelId: string) {
        console.log(`[SYNC] Deleting model: ${provider}/${modelId} from Mozart...`);
        try {
            await axios.delete(`${this.baseUrl}/api/v1/config/deleteModel`, { data: { AIProvider: provider, model: modelId } });
            return true;
        } catch (error) {
            console.error(`[SYNC] Error deleting model ${modelId}:`, error);
            return false;
        }
    }

    async createModel(provider: string, modelData: ModelInfo) {
        console.log(`[SYNC] Creating model: ${provider}/${modelData.modelId} on Mozart...`);
        try {
            await axios.post(`${this.baseUrl}/api/v1/config/createModel`, { AIProvider: provider, modelData: modelData });
            return true;
        } catch (error) {
            console.error(`[SYNC] Error creating model ${modelData.modelId}:`, error);
            return false;
        }
    }

    async getModels() {
        try {
            const response = await axios.post(`${this.baseUrl}/api/v1/config/getModels`);
            return response.data;
        } catch (error) {
            console.error('[SYNC] Error fetching models from Mozart:', error);
            return null;
        }
    }
}
