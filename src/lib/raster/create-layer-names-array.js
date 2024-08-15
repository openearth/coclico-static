/**
 * Function that has as input the dataset
 * and creates the layerNames list
 * workspace is always the dataset id
 * layerName is constructed from the properties of each item
 * propertyNames are read from the summaries
 */

export default function (dataset) {
  // Early return if dataset is falsy
  if (!dataset) return;

  // Extract property names from summaries
  const propertyNames = dataset.summaries.map(({ id }) => id);

  // Filter items from dataset links
  const items = dataset.links.filter(({ rel }) => rel === "item");

  // Generate layer names
  const layerNames = items.map(({ properties }) => {
    const propertyValues = propertyNames.map(
      (property) => properties?.[property] ?? ""
    );
    return `${dataset.id}:${propertyValues.join("_")}`;
  });

  return layerNames;
}
