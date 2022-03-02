import { slice, openArray } from "zarr";
import 'whatwg-fetch'


describe('zarr', () => {
    it('opens', async () => {
        const z = await openArray({
            store: "https://storage.googleapis.com/hydro-engine-public/coclico/CoastAlRisk_Europe_ESL_Historical.zarr",
            // store: "http://localhost:8080/waterlevel",
            path: "rp",
            mode: "r"
        });
        console.log(z);
    })
})
