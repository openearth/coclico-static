import { slice, openArray } from "zarr";
import _ from 'lodash'
import 'whatwg-fetch'


describe('zarr', () => {
    it('opens', async () => {
        const prArr = await openArray({
            store: "https://storage.googleapis.com/hydro-engine-public/coclico/CoastAlRisk_Europe_ESL_Historical.zarr",
            path: "rp",
            mode: "r"
        });
        expect(prArr).toBeDefined()

    })
    it('read latitude and longitude', async () => {
        let store = "https://storage.googleapis.com/hydro-engine-public/coclico/CoastAlRisk_Europe_ESL_Historical.zarr"
        const latArr = await openArray({
            store: store,
            path: "latitude",
            mode: "r"
        })
        const lonArr = await openArray({
            store: store,
            path: "longitude",
            mode: "r"
        });

        const lat = await latArr.get()
        const lon = await lonArr.get()

        const points = _.zip(lat.data, lon.data)
        expect(points).toHaveLength(11014)

    })
})
