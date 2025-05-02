import buildGeoServerUrl from "./build-geoserver-url";
//https://gis.stackexchange.com/questions/79201/lat-long-values-in-a-wms-getfeatureinfo-request

//copied from rws-viewers project

/**
 *
 * @param url {string}
 * @param lng {Number}
 * @param lat {Number}
 * @param layer {String}
 * @param layers {String[]}
 * @param x {Number}
 * @param y {Number}
 * @param bounds
 * @param width {Number}
 * @param height {Number}
 * @param keys {String[]}
 * @param propertyName {String[]}
 * @param rest
 * @returns {Promise<{data: *, LAU_NAME: *}>}
 */
export default async function getFeatureInfo({
  url,
  lng,
  lat,
  layer,
  layers,
  x = 50,
  y = 50,
  bounds,
  width = 110,
  height = 110,
  keys = ["GRAY_INDEX"],
  propertyName = [],
  ...rest
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
    layers: layer || names,
    query_layers: layer || names,
    width,
    height,
    x,
    y,
    bbox,
    feature_count: names.length,
    propertyName: [...keys, ...propertyName].join(","),
    ...rest,
  });

  return fetch(geoServerUrl)
    .then((response) => response.json())
    .then(({ features }) =>
      Boolean(features.length) ? features : Promise.reject(),
    )
    .catch(() => undefined);
}
