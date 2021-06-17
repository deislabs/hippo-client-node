export interface CreateTokenResponse {
    readonly token: string;
    readonly expiration: string;
}

export interface CreateApplicationResponse {
    readonly applicationGUID: string;
}

export interface CreateChannelResponse {
    readonly id: string;
}

export interface ChannelConfigFixedRevision {
    readonly revisionNumber: string;
}

export interface ChannelConfigRangeRule {
    readonly revisionRange: string;
}

export type ChannelConfig = ChannelConfigFixedRevision | ChannelConfigRangeRule;
