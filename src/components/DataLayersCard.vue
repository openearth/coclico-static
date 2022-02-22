<template>
<v-card dark raised max-height="80vh" class="pa-0 data-set-controls" data-v-step="3">
   <v-card-title class="h3">
      TEST
    </v-card-title>
</v-card>
</template>
<style scoped>
.data-set-controls {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: var(--spacing-default);
  right: var(--spacing-default);
  z-index: 5;
  width: 30vw;
  max-width: 400px;
  min-width: 250px;
}

.data-set-controls__text {
  height: 90%;
}

.data-set-controls__group {
  height: 100%;
  width: 100%;
}

.data-set-controls__tooltip, .data-set-controls__tooltip {
  position: relative;
  width: 100%;
  height: 100%;
}

.data-set-controls__tooltip-text::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 4px;
  width: 0;
  height: 0;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--v-quietHover-base);
  border-left: 8px solid transparent;
}

.data-set-controls__tooltip-text {
  position: relative;
  border-radius: 5px;
  background-color: var(--v-quietHover-base);
  box-shadow: 4px 6px 20px -4px rgba(0, 0, 0, 0.5);
  color: var(--v-textColor-base);
}

.switch {
  top: 8px;
  position: relative;
}

.v-expansion-panel {
  border-color: var(--v-background-base);
}

.v-input--selection-controls__input .v-icon {
  color: var(--v-primary-darken2);
}
</style>


