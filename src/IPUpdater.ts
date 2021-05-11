import * as DigestFetch from "digest-fetch";
import * as fs from "fs";
import * as publicIP from "public-ip";
import { IAtlasConfig } from "./AtlasConfig";
import { TypedDigestFetch } from "./DigestFetchExtensions";

export class IPUpdater {
    private atlasConfig: IAtlasConfig;

    private client: TypedDigestFetch;

    private lastPublishedIpFile: string;

    public constructor(atlasConfig: IAtlasConfig, lastPublishedIpFile: string) {
        this.atlasConfig = atlasConfig;
        this.client = new DigestFetch(this.atlasConfig.publicKey, this.atlasConfig.privateKey, {});
        this.lastPublishedIpFile = lastPublishedIpFile;
        if (!fs.existsSync(this.lastPublishedIpFile)) {
            fs.writeFileSync(this.lastPublishedIpFile, "");
        }
    }

    public async updatePublishedIp() {
        console.log("Reading last published IP");
        const lastPublishedIp = this.readLastPublishedIP();
        console.log(lastPublishedIp);

        console.log("Getting current public IP");
        const currentIP = await publicIP.v4();
        console.log("Public IP: " + currentIP);

        if (lastPublishedIp === currentIP) {
            console.log("IP already published");
            return;
        }

        if (lastPublishedIp !== "") {
            await this.deleteIP(lastPublishedIp);
        }

        console.log("Publishing IP address");
        await this.publishIP(currentIP);
        console.log("Success");
    }

    private readLastPublishedIP() {
        return fs.readFileSync(this.lastPublishedIpFile).toString().trim();
    }

    private async deleteIP(ipToDelete) {
        console.log("Deleting last published IP " + ipToDelete);
        const deleteRoute = "/groups/" + this.atlasConfig.groupId + "/accessList/" + ipToDelete;
        await this.client.fetch(this.atlasConfig.baseUrl + deleteRoute, {
            method: "DELETE",
        }).then(async (resp) => {
            if (!resp.ok && resp.status !== 404) {
                throw await resp.text();
            }
        }).catch((err) => {
            console.log(err);
        });
        console.log("Success");

        console.log("Emptying public-ip.txt");
        await fs.writeFile(this.lastPublishedIpFile, "", (err) => {
            throw err;
        });
        console.log("Success");
    }

    private async publishIP(ip) {
        const publishRoute = "/groups/" + this.atlasConfig.groupId + "/accessList";
        console.log("   Sending request "  + publishRoute);
        await this.client.fetch(this.atlasConfig.baseUrl + publishRoute, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify([{
                ipAddress: ip,
            }]),
        }).then(async (result) => {
            if (!result.ok) {
                throw await result.text();
            }
        }).catch((err) => {
            console.log(err);
        });
        console.log("   Success");

        console.log("   Writing public-ip.txt");
        fs.writeFile(this.lastPublishedIpFile, ip, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log("   Success");
    }
}
