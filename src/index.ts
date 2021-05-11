
import { exit } from "process";
import { IPUpdater } from "./IPUpdater";
import readMongoAtlasConfig from "./readEnvConfig";

try {
    const atlasConfig = readMongoAtlasConfig("./" + process.env.NODE_ENV + ".env");

    const updater = new IPUpdater(
        atlasConfig,
        `./public-ip.${atlasConfig.env}.txt`,
    );

    updater.updatePublishedIp().then(() => {
        console.log("Finished without errors");
    }).catch((err) => {
        console.error(err);
    });
} catch (err) {
    console.error(err);
    exit(1);
}
