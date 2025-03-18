import buildGeoServerUrl from "./build-geoserver-url";
//https://gis.stackexchange.com/questions/79201/lat-long-values-in-a-wms-getfeatureinfo-request

//copied from rws-viewers project

export default async function getFeatureInfo({
  url,
  lng,
  lat,
  layers,
  x = 50,
  y = 50,
  bounds,
  width = 110,
  height = 110,
  keys = ["GRAY_INDEX"],
}) {
  let bbox = null;
  // Bounding box used with area selection.

  if (bounds) {
    bbox = [
      bounds._sw.lng,
      bounds._sw.lat,
      bounds._ne.lng,
      bounds._ne.lat,
    ].join();
  }

  // Bounding box used with single point selection.
  if (lng && lat) {
    // raster requires a smaller bounding box to prevent selecting nearby points.
    const radius = 0.00001;
    bbox = [lng - radius, lat - radius, lng + radius, lat + radius].join(",");
  }

  const names = layers.flatMap(({ name }) => name);

  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: "GetFeatureInfo",
    service: "WMS",
    version: "1.1.1",
    info_format: "application/json",
    crs: "EPSG:4326",
    layers: names,
    query_layers: names,
    width,
    height,
    x,
    y,
    bbox,
    feature_count: names.length,
  });

  return fetch(geoServerUrl)
    .then((response) => response.json())
    .then(({ features }) =>
      Boolean(features.length) ? features : Promise.reject(),
    )
    .then((features) =>
      layers.flatMap((layer, index) => ({
        ...layer,
        value:
          keys.length === 1
            ? features[index].properties[keys[0]]
            : Object.fromEntries(
                keys.map((key) => [
                  key,
                  features?.[index]?.properties?.[key] || null,
                ]),
              ),
      })),
    )
    .catch(() => undefined);
}
