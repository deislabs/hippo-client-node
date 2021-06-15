import axios, { AxiosRequestConfig } from 'axios';
import * as https from 'https';
import { CreateTokenResponse } from './types';

export class HippoClient {
    constructor(
        private readonly baseUrl: string,
        private readonly token: string,
        private agent?: https.Agent
    ) {
        // Suppress unused member errors for now
        console.log(this.baseUrl);
        console.log(this.token);
    }

    requestConfig(headers?: { [key: string]: string }): AxiosRequestConfig | undefined {
        return requestConfig(this.agent, headers);
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

