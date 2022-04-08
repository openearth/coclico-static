export default {
  state: () => ({
    steppers: [ 
    {
    name: 'Landing page',
    step: 1,
    icon: 'mdi-information-outline',
    color: 'orangeCoClico'  
    },
    {
    name: 'Stories',
    step: 2,
    icon: 'mdi-account-details',
    color: 'orangeCoClico'  
    },
    {
    name: 'Platform',
    step: 3,
    icon: 'mdi-database-search',
    color: 'orangeCoClico'  
    },
    {
    name: 'Workbench',
    step: 4,
    icon: 'mdi-hammer',
    color: 'orangeCoClico'  
    } ]
}),
  getters: { 
    steppers(state) {
      return state.steppers
    }
  }
}
