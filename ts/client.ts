import axios, { AxiosRequestConfig } from 'axios';
import * as https from 'https';
import { ChannelConfig, ChannelConfigFixedRevision, CreateApplicationResponse, CreateChannelResponse, CreateTokenResponse } from './types';

export class HippoClient {
    constructor(
        private readonly baseUrl: string,
        private readonly token: string,
        private agent?: https.Agent
    ) { }

    requestConfig(headers?: { [key: string]: string }): AxiosRequestConfig | undefined {
        const authHeaders = headers || {};
        authHeaders['Authorization'] ||= `Bearer ${this.token}`;
        return requestConfig(this.agent, authHeaders);
    }

    public static async new(baseUrl: string, username: string, password: string, agent?: https.Agent): Promise<HippoClient> {
        const safeBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const token = await this.createToken(safeBaseUrl, username, password, agent);
        return new HippoClient(safeBaseUrl, token, agent);
    }

    private static async createToken(baseUrl: string, username: string, password: string, agent?: https.Agent): Promise<string> {
        const body = JSON.stringify({ username, password });
        const url = `${baseUrl}account/createtoken`;
        const config = requestConfig(agent);
        const response = await axios.post(url, body, config);
        if (response.status === 201) {
            const responseData = response.data as CreateTokenResponse;
            return responseData.token;
        }
        throw new Error(`createToken: request failed: ${response.status} ${response.statusText}`);
    }

    public async registerRevision(bindleName: string, revisionNumber: string): Promise<void> {
        const body = JSON.stringify({ appStorageId: bindleName, revisionNumber });
        const url = `${this.baseUrl}api/revision`;
        const response = await axios.post(url, body, this.requestConfig());
        if (response.status === 201) {
            return;
        }
        throw new Error(`registerRevision: request failed: ${response.status} ${response.statusText}`);
    }

    public async createApplication(applicationName: string, bindleName: string): Promise<string> {
        const body = JSON.stringify({ applicationName, storageId: bindleName });
        const url = `${this.baseUrl}api/application`;
        const response = await axios.post(url, body, this.requestConfig());
        if (response.status === 201) {
            const responseData = response.data as CreateApplicationResponse;
            return responseData.applicationGUID;
        }
        throw new Error(`createApplication: request failed: ${response.status} ${response.statusText}`);
    }

    public async createChannel(applicationId: string, channelName: string, channelConfig: ChannelConfig): Promise<string> {
        const body = JSON.stringify({ appId: applicationId, name: channelName, ...channelConfigToAPI(channelConfig) });
        const url = `${this.baseUrl}api/channel`;
        try {
            const response = await axios.post(url, body, this.requestConfig());
            if (response.status === 201) {
                const responseData = response.data as CreateChannelResponse;
                return responseData.id;
            }
            throw new Error(`createChannel: request failed: ${response.status} ${response.statusText}`);
        } catch (e) {
            if (e.response.data.errors) {
                throw new Error(JSON.stringify(e.response.data.errors));
            }
            throw e;
        }
    }
}

function requestConfig(agent: https.Agent | undefined, headers?: { [key: string]: string }): AxiosRequestConfig | undefined {
    const finalHeaders = headers || {};
    finalHeaders['Accept'] ||= 'application/json';
    finalHeaders['Content-Type'] ||= 'application/json';
    if (agent) {
        return { httpsAgent: agent, headers: finalHeaders };
    }
    return { headers: finalHeaders };
}

function isFixedRevisionConfig(channelConfig: ChannelConfig): channelConfig is ChannelConfigFixedRevision {
    return !!((<ChannelConfigFixedRevision>channelConfig).revisionNumber);
}

function channelConfigToAPI(channelConfig: ChannelConfig): { [key: string]: string | boolean } {
    if (isFixedRevisionConfig(channelConfig)) {
        return {
            fixedToRevision: true,
            revisionNumber: channelConfig.revisionNumber,
        };
    }
    return {
        fixedToRevision: false,
        revisionRange: channelConfig.revisionRange,
    };
}

