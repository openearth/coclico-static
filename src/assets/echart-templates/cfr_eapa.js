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
     "valueFormatter": (value) => `${value.toFixed(2)} e3 people`
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
  "series": [ {
    "markArea": {
      "itemStyle": {
        "color": 'rgba(255, 173, 177, 0.4)'
      },
      "data": [
        [
          {
            "name": 'Selected category',
            "xAxis": "1995"
          },
          {
            "xAxis": "2010"
          }
        ],
      ]
    }
  } ],
  "xAxis":{
     "splitLine":{
        "show":true
     },
     "axisLabel":{
        "fontSize":14
     },
     "nameLocation":"center",
     "nameGap":30,
     "name":"Time [years]",
     "nameTextStyle":{
        "color":"white",
        "fontSize":14,
        "fontFamily":"Helvetica"
     }
  },
  "yAxis":{
     "type":"value",
     "min":0,
     "max":200,
     "axisLabel":{
        "fontSize":14,
        "formatter": function (value, index) {
            return value / 1;
        }
     },
     "nameLocation":"center",
     "name":"People affected [1e3]",
     "nameGap":45,
     "nameTextStyle":{
        "color":"white",
        "fontSize":14,
        "fontFamily":"Helvetica"
     }
  }
}
