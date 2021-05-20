import fs from "fs";
import readMongoAtlasConfig from "../dist/readEnvConfig";

const dummybaseUrl = "baseUrl";
const dummyPublicKey = "publicKey";
const dummyPrivateKey = "privateKey";
const dummyGroupId = "groupId";
const configPath = "./test/dummy.env";

// prepare dummy file
fs.writeFileSync(configPath,
    `ATLAS_API_BASE_URL=${dummybaseUrl}\n` +
    `ATLAS_API_PUBLIC_KEY=${dummyPublicKey}\n` +
    `ATLAS_API_PRIVATE_KEY=${dummyPrivateKey}\n` +
    `ATLAS_GROUP_ID=${dummyGroupId}\n`);

test("should correctly read env config", () => {
    const readConfig = readMongoAtlasConfig(configPath);
    expect(readConfig.env).toBe("test");
    expect(readConfig.baseUrl).toBe(dummybaseUrl);
    expect(readConfig.groupId).toBe(dummyGroupId);
    expect(readConfig.privateKey).toBe(dummyPrivateKey);
    expect(readConfig.publicKey).toBe(dummyPublicKey);
});
