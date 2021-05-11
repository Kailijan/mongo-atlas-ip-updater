export interface IAtlasConfig {
    baseUrl: string;
    publicKey: string;
    privateKey: string;
    groupId: string;
    env: "dev" | "qs" | "prod" | "test" | string;
}
