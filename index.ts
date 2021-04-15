import * as dotenv from "dotenv";
import { exit } from "process";
import { IAtlasConfig } from "./AtlasConfig";
import { IPUpdater } from "./IPUpdater";

try {
    const atlasConfig = readEnvConfig();

    const updater = new IPUpdater(atlasConfig);

    updater.updatePublishedIp().then(() => {
        console.log("Finished without errors");
    }).catch((err) => {
        console.error(err);
    });
} catch (err) {
    console.error(err);
    exit(1);
}

function readEnvConfig(): IAtlasConfig {
    const parseEnv = dotenv.config({
        path: process.env.NODE_ENV + ".env",
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
