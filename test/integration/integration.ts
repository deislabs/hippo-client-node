import * as https from 'https';
import "mocha";
// import { assert } from 'chai';

import * as hippo from '../../ts/index';

const testAgent = new https.Agent({ rejectUnauthorized: false });
const DEMO_SERVER_URL = 'https://localhost:5001';

describe("Hippo", () => {
    it("can log in", async () => {
        await hippo.HippoClient.new(DEMO_SERVER_URL, "admin", "Passw0rd!", testAgent);
    });
    it("can register a revision", async () => {
        const client = await hippo.HippoClient.new(DEMO_SERVER_URL, "admin", "Passw0rd!", testAgent);
        await client.registerRevision("hippos.rocks/helloworld", "1.1.3");
    });
    it("can create an application", async () => {
        const client = await hippo.HippoClient.new(DEMO_SERVER_URL, "admin", "Passw0rd!", testAgent);
        await client.createApplication("weather", "contoso/weather");
    });
    it("can create a channel", async () => {
        const client = await hippo.HippoClient.new(DEMO_SERVER_URL, "admin", "Passw0rd!", testAgent);
        const appId = await client.createApplication("chills", "music/submarinebells");
        await client.createChannel(appId, "Efflorescence", { revisionNumber: "1.2.3" });
        await client.createChannel(appId, "Deliquescence", { revisionRange: "~1.1" });
    });
});
