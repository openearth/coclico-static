/**
 * Function that has as input the dataset
 * and creates the layerNames list
 * workspace is always the dataset id
 * layerName is constructed from the properties of each item
 * propertyNames are read from the summaries
 */
import { get } from "lodash-es";

export default function (mapboxLayer) {
  // Early return if dataset is falsy
  if (!mapboxLayer) return;

  // Find first item
  const tiles = get(mapboxLayer.source, "tiles");
  let urlObject = new URL(tiles[0]);

  // Get the base URL (without query parameters)
  let baseUrl = urlObject.origin + urlObject.pathname;

  return baseUrl;
}
