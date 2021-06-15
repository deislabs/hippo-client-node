import axios, { AxiosRequestConfig } from 'axios';
import * as https from 'https';

export class HippoClient {
    constructor(
        private readonly baseUrl: string,
        private agent?: https.Agent
    ) {}
}
