import * as dotenv from "dotenv";
import { IAtlasConfig } from "./AtlasConfig";

export function readMongoAtlasConfig(envFilePath: string): IAtlasConfig {
    const parseEnv = dotenv.config({
        path: envFilePath,
    });

    let envConfig;
    if (parseEnv.error) {
        throw parseEnv.error;
    } else {
        envConfig = parseEnv.parsed;
    }

    const expectedConfigKeys = [
        "ATLAS_API_BASE_URL",
        "ATLAS_API_PUBLIC_KEY",
        "ATLAS_API_PRIVATE_KEY",
        "ATLAS_GROUP_ID",
    ];

    expectedConfigKeys.forEach((configKey) => {
        if (!envConfig[configKey]) {
            throw new Error(configKey + " is not set");
        }
    });

    return {
        baseUrl: envConfig.ATLAS_API_BASE_URL,
        groupId: envConfig.ATLAS_GROUP_ID,
        privateKey: envConfig.ATLAS_API_PRIVATE_KEY,
        publicKey: envConfig.ATLAS_API_PUBLIC_KEY,
        env: process.env.NODE_ENV,
    };
}

module.exports = readMongoAtlasConfig;
