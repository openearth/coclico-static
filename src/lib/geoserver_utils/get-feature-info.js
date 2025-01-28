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

  return (
    fetch(geoServerUrl)
      .then((response) => response.json())
      .then(({ features }) => features)
      //map and send back only the greyIndex values
      .then((features) =>
        layers.map((layer, index) => ({
          ...layer,
          value: features[index].properties.GRAY_INDEX,
        }))
      )
      .catch(() => undefined)
  );
}
