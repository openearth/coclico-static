/**
 * Function that has as input the dataset
 * and based on the selected properties
 * returns one layer from the dataset object
 *
 *
 */
import { get } from "lodash-es";

export default function (dataset) {
  if (!dataset) {
    return;
  }
  const { links, summaries } = dataset;
  const filterByProperty = ({ properties }) => {
    if (properties) {
      const array = summaries.map(({ id, chosenValue }) => {
        const propVal = get(properties, id);
        return propVal === chosenValue;
      });
      return array.every(Boolean);
    }
  };
  const layer = links.find(filterByProperty);
  if (!layer) {
    return;
  }
  return layer;
}
