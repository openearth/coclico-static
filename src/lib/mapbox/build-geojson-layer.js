export default ({id, properties, assets }) => {
  const { mapbox } = assets
  return {
    id,
    type: properties['deltares:type'],
    source: {
      type: mapbox.type,
      url: 'mapbox://global-data-viewer.6v63xk2e'//mapbox.href
    },
    'source-layer': 'EU_EESSL_JRC_Hist_RP_flat-74xh1t', //mapbox.source
    paint: properties['deltares:paint'],
  }
}
