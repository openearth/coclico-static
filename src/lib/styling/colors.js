import entries from 'lodash/entries'
import merge from 'lodash/fp/merge'
//the coclico theme has the Coclico colors

export const coclico = {
  black100: '#000000',
  error: '#de071c',
  grey05: '#f3f3f3',
  grey100: '#202020',
  grey20: '#d2d2d2',
  grey40: '#a5a5a5',
  grey60: '#787878',
  grey80: '#4c4c4c',
  informative: '#134fff',
  metallic100: '#92b6c7',
  orange: '#ffa827',
  sand100: '#a09e8d',
  success: '#028200',
  turqoise: '#28cc9b',
  warning: '#f79502',
  white100: '#ffffff',
  green: '#068B95',
}


const context = {
  primary: {
    coclico: coclico.green,
  },
  primaryHover: {
    coclico: coclico.orange,
  },
  primaryFocus: {
    coclico: coclico.orange,
  },
  primaryPressed: {
    coclico: coclico.orange,
  },
  secondary: {
    coclico: coclico.orange,
  },
  secondaryHover: {
    coclico: coclico.white100,
  },
  secondaryFocus: {
    coclico: coclico.white100,
  },
  secondaryPressed: {
    coclico: coclico.white100,
  },
  quiet: {
    coclico: 'transparent',
  },
  quietHover: {
    coclico: coclico.green,
  },
  quietFocus: {
    coclico: coclico.white100,
  },
  quietPressed: {
    coclico: coclico.green,
  },
  background: {
    coclico: coclico.green,
  },
  buttonColor: {
    coclico: coclico.green,
  },
  buttonColorContrast: {
    coclico: coclico.green,
  },
  textColor: {
    coclico: coclico.white100,
  },
  textInverted: {
    coclico: coclico.black100,
  },
  formBase: {
    coclico: coclico.green,
  },
  formBackground: {
    coclico: coclico.white100
  },
  formActive: {
    coclico: coclico.orange,
  }
}

export default function getColors (theme) {
  const baseColors = coclico
  const contextColors = entries(context)
    .map(([ key, value ]) => ({ [key]: value[theme] }))
    .reduce(merge)

  return merge(baseColors, contextColors)
}
