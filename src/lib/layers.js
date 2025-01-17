import getCatalog from "@/lib/request/get-catalog";

/**
 * ENUM of ResourceType To Layer Function
 * @type {{"application/vnd.apache.parquet": (function(*, *): {id: *, type: string, source: {type: string, tiles: [any], minZoom: number, maxZoom: number}, "source-layer": *|null, paint: {"fill-color": string, "fill-opacity": number}}), "image/tiff; application=geotiff; profile=cloud-optimized": (function({id: *, assets: *, tileSize?: number}, *): {id: *, type: string, source: {type: string, tiles: [*], tileSize: number}}), "image/png": (function({id: *, assets: *, tileSize?: number}, *): {id: *, type: string, source: {type: string, tiles: [*], tileSize: number}}), "application/png": (function({id: *, assets: *, tileSize?: number}, *): {id: *, type: string, source: {type: string, tiles: [*], tileSize: number}}), vector: (function({id: *, properties: *, assets: *}, *): {id: *, type: *, source: {type: *, url: *}, "source-layer": *, paint: *}), geojson: (function({id: *, properties: *, assets: *}, *): {id: *, type: *, source: {type: *, url: *}, "source-layer": *, paint: *})}}
 */
const ResourceTypeFunctionMask = {
  "application/vnd.apache.parquet": buildVectorTileMapboxLayer,
  "image/tiff; application=geotiff; profile=cloud-optimized":
    buildRasterMapboxLayer,
  "image/png": buildRasterMapboxLayer,
  "application/png": buildRasterMapboxLayer,
  vector: buildGeojsonMapboxLayer,
  geojson: buildGeojsonMapboxLayer,
};

/**
 * Creates a mapbox layer object of a resource.
 * It checks if the resource is a raster or vector tile or geojson object and returns the corresponding object to be added to the map as a layer.
 * @param collection
 * @returns {Promise<*[]>}
 */
export async function getResourceLayers(collection) {
  if (!collection?.assets) throw new Error("Collection resource has no assets");
  const layer = matchLayerIdToProperties(collection);
  if (!layer) {
    return;
  }
  const item = { ...(await getCatalog(layer.href)), id: collection.id };
  if (!item) throw new Error("Item resource not found in Collection resource");
  if (!item?.assets) throw new Error("Item resource has no assets");
  const transparentLayer =
    "geoserver_link" in collection.assets
      ? ResourceTypeFunctionMask[collection.assets.geoserver_link.type](
          collection,
          "geoserver_link"
        )
      : null;
  const mapbox =
    "mapbox" in item.assets
      ? ResourceTypeFunctionMask[item.assets.mapbox.type](item, "mapbox")
      : null;
  const visual =
    "visual" in item.assets
      ? ResourceTypeFunctionMask[item.assets.visual.type](item, "visual")
      : null;

  return [
    ...(mapbox ? [mapbox] : []),
    ...(visual ? [visual] : []),
    ...(transparentLayer ? [transparentLayer] : []),
  ];
}

/**
 * Build a GeoJSON Mapbox layer from an Item Resource
 * @param id
 * @param properties
 * @param assets
 * @param assetKey
 * @returns {{id, type, source: {type, url}, "source-layer", paint}}
 */
export function buildGeojsonMapboxLayer({ id, properties, assets }, assetKey) {
  const asset = assets?.[assetKey];
  return {
    id: `${id}_${assetKey}`,
    type: properties["deltares:type"],
    source: {
      type: asset.type,
      url: asset.href,
    },
    "source-layer": asset.source,
    paint: properties["deltares:paint"],
  };
}

/**
 * Build a raster layer for Mapbox
 * @param id
 * @param assets
 * @param tileSize
 * @param assetKey
 * @returns {{id, type: string, source: {type: string, tiles: *[], tileSize: number}}}
 */
export function buildRasterMapboxLayer(
  { id, assets, tileSize = 256 },
  assetKey
) {
  const asset = assets?.[assetKey];
  return {
    id: `${id}_${assetKey}`,
    type: "raster",
    source: {
      type: "raster",
      tiles: [asset.href],
      tileSize,
    },
  };
}

/**
 * Build a Mapbox vector tile layer from an Item Resource
 * @param dataset
 * @param assetKey
 * @returns {{id: *, type: string, source: {type: string, tiles: *[], minZoom: number, maxZoom: number}, "source-layer": *, paint: (*|{"fill-color": string, "fill-opacity": number})}}
 */
export function buildVectorTileMapboxLayer(dataset, assetKey) {
  const paint =
    "properties" in dataset && "deltares:paint" in dataset?.properties
      ? dataset.properties["deltares:paint"]
      : {
          "fill-color": "#0080ff",
          "fill-opacity": 0,
        };
  const asset = dataset?.assets?.[assetKey];
  if (!asset) throw new Error("Asset not found in resource");
  const layer = asset.href.match(/LAYER=([^&]*)/);
  let id = layer ? layer[1] : null;
  if (!id)
    throw new Error(`Layer not found in resource url: \n${asset.href}\n`);
  id = id.split(":")[1];

  return {
    id: `${dataset.id}_${assetKey}`,
    type: "fill",
    source: {
      type: "vector",
      tiles: [asset.href],
      minZoom: 6,
      maxZoom: 20,
    },
    "source-layer": id,
    paint,
  };
}

/**
 * Function that has as input the dataset
 * and based on the selected properties
 * returns one layer from the dataset object
 * @param dataset
 * @returns {unknown}
 */
export function matchLayerIdToProperties(dataset) {
  if (!dataset) {
    return;
  }
  const { links, summaries } = dataset;
  const findByProperty = ({ properties = {} }) =>
    summaries.find(({ id, chosenValue }) => properties?.[id] === chosenValue);
  const items = links.filter(({ rel }) => rel === "item");
  if (!items.length) return;
  return items.length === 1 ? items[0] : items.find(findByProperty);
}

export function hasLegend(dataset) {
  const isVector = "geoserver_link" in dataset.assets;
  const hasGradient = "deltares:linearGradient" in dataset;
  return isVector && hasGradient;
}
