export interface CreateTokenResponse {
    readonly token: string;
    readonly expiration: string;
}

export interface CreateApplicationResponse {
    readonly applicationGUID: string;
}
