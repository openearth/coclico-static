# coclico-static

## Project setup
```bash
npm install
```

### Compiles and hot-reloads for development
```bash
npm run dev
```

### Compiles and minifies for production
```bash
npm run build
```

### Preview the production build locally
```bash
npm run serve
```

### Lints and fixes files
```bash
npm run lint
```

## Data structure

To keep supply and consumption of data consistent, a standard for data collections is agreed upon.  
The `./current` folder in `@openearth/coclicodata` is the considered the data root.  
Child folders in the root are considered **"Themes"** or **"Collections"** and contain a `collection.json` that defines
the data and visual resources inside that collection, including metadata.  
The collection points to its children folders in relation to possible variables as defined in the `collection.json`,
these children are considered **"Items"**.  
All **Items** and **Collections** contain an **"Assets"** object that defines its resources. These resources are
standardized internally in the team.

More info on asset types can be found in [ASSETS.md](./docs/ASSETS.md).

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
