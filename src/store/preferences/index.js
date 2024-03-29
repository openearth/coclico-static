import getColors from '../../lib/styling/colors'

const color = getColors('coclico')

export default {
  state: () => ({
    steppers: [ 
    {
    name: 'Landing page',
    step: 1,
    icon: 'mdi-information-outline',
    color: color.quiet  
    },
    {
    name: 'Stories',
    step: 2,
    icon: 'mdi-account-details',
    color: color.secondary
    },
    {
    name: 'Platform',
    step: 3,
    icon: 'mdi-database-search',
    color: color.secondary 
    },
    {
    name: 'Workbench',
    step: 4,
    icon: 'mdi-hammer',
    color: color.quiet
    } ]
}),
  getters: { 
    steppers(state) {
      return state.steppers
    }
  }
}
