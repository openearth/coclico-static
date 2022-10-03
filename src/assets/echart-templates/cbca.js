export default {
  "tooltip":{
     "trigger":"axis",
     "axisPointer":{
        "type":"shadow"
     },
     "backgroundColor":"rgba(50,50,50,0.7)",
     "textStyle":{
        "color":"#fff"
     },
     "valueFormatter": (value) => `${value.toFixed(2)} MW/m`
  },
  "legend":{
     "top":"horizontal"
  },
  "grid":{
     "show":true,
     "top":30,
     "bottom":50,
     "right":20,
     "left":60
  },
  "dataZoom":[
     {
        "type":"inside",
        "realtime":true
     }
  ],
  "textStyle":{
     "fontFamily":"Helvetica"
  },
  "xAxis": {
    "name": "xAxis"
  }
}
