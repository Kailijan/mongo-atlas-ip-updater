import * as DigestFetch from "digest-fetch";
import * as fs from "fs";
import * as publicIP from "public-ip";
import { IAtlasConfig } from "./AtlasConfig";

export class IPUpdater {
    private atlasConfig: IAtlasConfig;

    private client: DigestFetch;

    private lastPublishedIpFile: string;

    public constructor(atlasConfig: IAtlasConfig) {
        this.atlasConfig = atlasConfig;
        this.client = new DigestFetch(this.atlasConfig.publicKey, this.atlasConfig.privateKey, {});
        this.lastPublishedIpFile = "./public-ip." + this.atlasConfig.env + ".txt";
        if (!fs.existsSync(this.lastPublishedIpFile)) {
            fs.writeFileSync(this.lastPublishedIpFile, "");
        }
    }

    public async updatePublishedIp() {
        console.log("Reading last published IP");
        const lastPublishedIp = fs.readFileSync(this.lastPublishedIpFile).toString().trim();
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

    private async deleteIP(ipToDelete) {
        console.log("Deleting last published IP " + ipToDelete);
        const deleteRoute = "/groups/" + this.atlasConfig.groupId + "/accessList/" + ipToDelete;
        const res = await this.client.fetch(this.atlasConfig.baseUrl + deleteRoute, {
            method: "DELETE",
        })
            .then((resp) => {
                try {
                    return resp.json();
                } catch (err) {
                    return resp;
                }
            })
            .catch((err) => {
                console.log(err);
            });
        if (res?.error && res.error !== 404) {
            throw res;
        }
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
        const res = await this.client.fetch(this.atlasConfig.baseUrl + publishRoute, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify([{
                ipAddress: ip,
            }]),
        })
            .then((resp) => {
                try {
                    return resp.json();
                } catch (err) {
                    return resp;
                }
            })
            .catch((err) => {
                console.log(err);
            });
        if (res?.error) {
            throw res;
        }
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
