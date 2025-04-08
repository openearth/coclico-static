import getCatalog from "@/lib/request/get-catalog";

/**
 * ENUM of ResourceType To Layer Function
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
 * @param {Object} collection
 * @param {Object} [properties]
 * @returns {Promise<*[]> | undefined}
 */
export async function getResourceLayers(collection, properties) {
  if (!collection?.assets) throw new Error("Collection resource has no assets");
  const layer = matchLayerIdToProperties(collection, properties);
  if (!layer) {
    return;
  }
  const item = {
    ...(await getCatalog(encodeURI(layer.href))),
    id: collection.id,
  };
  if (!item) throw new Error("Item resource not found in Collection resource");
  if (!item?.assets) throw new Error("Item resource has no assets");
  const transparentLayer =
    "geoserver_link" in collection.assets
      ? ResourceTypeFunctionMask[collection.assets.geoserver_link.type](
          collection,
          "geoserver_link",
        )
      : [];

  const mapbox =
    "mapbox" in item.assets
      ? ResourceTypeFunctionMask[item.assets.mapbox.type](
          item,
          "mapbox",
          properties,
        )
      : [];
  const visual =
    "visual" in item.assets
      ? ResourceTypeFunctionMask[item.assets.visual.type](
          item,
          "visual",
          properties,
        )
      : [];
  return [
    ...(Array.isArray(mapbox) ? mapbox : [mapbox]),
    ...(Array.isArray(visual) ? visual : [visual]),
    ...(Array.isArray(transparentLayer)
      ? transparentLayer
      : [transparentLayer]),
  ];
}

/**
 * Build a GeoJSON Mapbox layer from an Item Resource
 * @param id
 * @param properties
 * @param assets
 * @param assetKey
 * @param {Object}[props]
 * @returns {{id, type, source: {type, url}, "source-layer", paint}}
 */
export function buildGeojsonMapboxLayer(
  { id, properties, assets },
  assetKey,
  props,
) {
  const asset = assets?.[assetKey];
  const suffix =
    typeof props === "object"
      ? `_${Object.values(props).join("_").toLowerCase().trim()}`
      : "";
  return {
    id: `${id}_${assetKey}${suffix}`,
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
 * @param {Object}props
 * @returns {{id, type: string, source: {type: string, tiles: *[], tileSize: number}}}
 */
export function buildRasterMapboxLayer(
  { id, assets, tileSize = 256 },
  assetKey,
  props,
) {
  const asset = assets?.[assetKey];
  const suffix =
    typeof props === "object"
      ? `_${Object.values(props).join("_").toLowerCase().trim()}`
      : "";
  return {
    id: `${id}_${assetKey}${suffix}`,
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
 * @param {Object}props
 */
export function buildVectorTileMapboxLayer(dataset, assetKey, props) {
  const definedPaint =
    "properties" in dataset && "deltares:paint" in dataset.properties
      ? dataset.properties["deltares:paint"]
      : null;
  const definedLinePaint = definedPaint
    ? Object.fromEntries(
        Object.entries(dataset.properties).filter(([key]) =>
          key.startsWith("line"),
        ),
      )
    : {};
  const definedFillPaint = definedPaint
    ? Object.fromEntries(
        Object.entries(dataset.properties).filter(([key]) =>
          key.startsWith("fill"),
        ),
      )
    : {};
  const fillPaint = {
    "fill-color": "#0080ff",
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.25,
      0,
    ],
    ...definedFillPaint,
  };
  const linePaint = {
    "line-color": "#000000",
    ...definedLinePaint,
  };

  const asset = dataset?.assets?.[assetKey];
  if (!asset) throw new Error("Asset not found in resource");
  const layerName = getLayerName(asset);
  if (!layerName)
    throw new Error(`Layer not found in resource url: \n${asset.href}\n`);
  const suffix =
    typeof props === "object"
      ? `_${Object.values(props).join("_").toLowerCase().trim()}`
      : "";

  return [
    {
      id: `${dataset.id}_${assetKey}${suffix}`,
      type: "fill",
      source: {
        type: "vector",
        tiles: [asset.href],
        minZoom: 0,
        maxZoom: 22,
      },
      "source-layer": layerName,
      paint: fillPaint,
    },
    ...(props
      ? [
          {
            id: `${dataset.id}_${assetKey}${suffix}-line`,
            type: "line",
            source: {
              type: "vector",
              tiles: [asset.href],
              minZoom: 0,
              maxZoom: 22,
            },
            "source-layer": layerName,
            layout: { "line-join": "round" },
            paint: linePaint,
          },
        ]
      : []),
  ];
}

/**
 * Function that has as input the dataset
 * and based on the selected properties
 * returns one layer from the dataset object
 * @param dataset
 * @param {object} [activeProperties]
 * @returns {unknown}
 */
export function matchLayerIdToProperties(dataset, activeProperties) {
  if (!dataset) {
    return;
  }
  const { links } = dataset;
  const items = links.filter(({ rel }) => rel === "item");
  if (!items.length) return;
  return items.length === 1 || !activeProperties
    ? items[0]
    : items.find(({ properties = {} }) =>
        Object.entries(activeProperties)
          .map(
            ([key, value]) => properties?.[key] === value || !properties?.[key],
          )
          .every(Boolean),
      ) || items[0];
}

/**
 * Checks if the dataset has a legend
 * @param dataset
 * @returns {boolean}
 */
export function hasLegend(dataset) {
  // const isVector = "geoserver_link" in dataset.assets;
  return "deltares:linearGradient" in dataset;
}

/**
 * Returns the layer name from a tile URL inside a layer or asset object
 * @param layer
 * @returns {*}
 */
export function getLayerName(layer) {
  if (!layer) return;
  const href = "href" in layer ? layer.href : layer.source.tiles[0];
  const match = href.match(/LAYER=([^&]*)/) || href.match(/layers=([^&]*)/);
  if (!match) return;
  const [, layerName] = match[1].split(":");
  return layerName;
}

const transparentLayerRegex = /geoserver_link/;
const visualLayerRegex = /visual/;

/**
 * Returns the layer type based on the layer id
 * @param layer
 * @returns {"clickable" | "visual"}
 */
export function getLayerType(layer) {
  if (layer?.type === "circle") return "geojson";
  if (transparentLayerRegex.test(layer?.id)) return "clickable";
  if (visualLayerRegex.test(layer?.id)) return "visual";
}

/**
 * Prepare the highlight source and layer and initialize on the map
 * @param map
 */
export function prepareHighlightSource(map) {
  map.addSource("highlight", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });
  map.addLayer({
    id: "highlight",
    type: "fill",
    source: "highlight", // reference the data source
    layout: {},
    paint: {
      "fill-color": "#0080ff", // blue color fill
      "fill-opacity": 0.5,
    },
  });
}

/**
 * Set the highlight source data based on the queried features
 * @param map
 * @param {array | undefined} [queriedFeatures]
 * @param {array | undefined} [clickableDatasetsIds]
 * @param {"click" | "hover"} [event]
 * @param {string | undefined} highlightedId
 */
export function setHighlight({
  map,
  queriedFeatures,
  clickableDatasetsIds,
  event = "click",
  highlightedId,
}) {
  if (highlightedId) {
    map.setPaintProperty(highlightedId, "fill-opacity", 0);
    return;
  }
  const feature = queriedFeatures?.find((feature) =>
    clickableDatasetsIds.some((id) => feature.layer.id.startsWith(id)),
  );
  const layerId =
    feature?.layer?.id ||
    map.getLayer(`${clickableDatasetsIds?.[0]}_geoserver_link`)?.id;
  if (!layerId) return;
  const giscoId = feature?.properties?.["GISCO_ID"] || null;
  map.setPaintProperty(layerId, "fill-opacity", [
    "case",
    ["boolean", ["==", ["get", "GISCO_ID"], giscoId], false],
    event === "click" ? 0.5 : 0.2,
    0,
  ]);
  map.setPaintProperty(
    layerId,
    "fill-color",
    event === "empty" ? "#DC7609" : "#0080ff",
  );
  return event === "click" ? feature?.layer?.id : null;
}
