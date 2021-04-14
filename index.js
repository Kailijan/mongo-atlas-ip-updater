import * as dotenv from 'dotenv';
import DigestFetch from 'digest-fetch';
import * as publicIP from 'public-ip';
import * as fs from 'fs';

const result = dotenv.config();
let envConfig;

if (result.error) {
    throw 'Could not parse .env';
} else {
    envConfig = result.parsed;
}

const lastPublishedIpFile = './public-ip.txt';
const lastPublishedIp = fs.readFileSync(lastPublishedIpFile).toString().trim();

const baseUrl = envConfig['ATLAS_API_BASE_URL'];

const client = new DigestFetch(envConfig['ATLAS_API_PUBLIC_KEY'], envConfig['ATLAS_API_PRIVATE_KEY']);

updatePublishedIp().then((value) => {
    console.log('Successfully published IP address');
}).catch((err) => {
    console.error(err);
});

async function updatePublishedIp() {
    console.log('Getting current public IP');
    const currentIP = await publicIP.v4();
    console.log('Public IP: ' + currentIP);

    if (lastPublishedIp === currentIP) {
        console.log('IP already published')
        return;
    }

    if (lastPublishedIp !== '') {
        await deleteLastPublishedIP();
    }

    console.log('Publishing IP address');
    await publishIP(currentIP);
    console.log('Success');
}

async function deleteLastPublishedIP() {
    console.log('Deleting last published IP ' + lastPublishedIp);
    const deleteRoute = '/groups/' + envConfig['ATLAS_GROUP_ID'] + '/accessList/' + lastPublishedIp;
    let res = await client.fetch(baseUrl + deleteRoute, {
        method: 'DELETE'
    })
    .then(resp => {
        try {
            return resp.json();
        } catch (err) {
            return resp;
        }
    })
    .catch(err => {
        throw err;
    });
    if (!res || res?.error) {
        throw res;
    }
    console.log('Success');

    console.log('Emptying public-ip.txt');
    await fs.writeFile(lastPublishedIpFile, '');
    console.log('Success');
}

async function publishIP(ip) {
    let publishRoute = '/groups/' + envConfig['ATLAS_GROUP_ID'] + '/accessList';
    let res = await client.fetch(baseUrl + publishRoute, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify([{
            'ipAddress': ip
        }])
    })
    .then(resp => {
        try {
            return resp.json();
        } catch (err) {
            return resp;
        }
    })
    .catch((err) => {
        throw err;
    });
    if (!res || res.error) {
        throw res;
    }

    console.log('   Writing public-ip.txt');
    fs.writeFile(lastPublishedIpFile, ip, (err) => {
        if (err) {
            throw err;
        }
    });
    console.log('   Success');
}
