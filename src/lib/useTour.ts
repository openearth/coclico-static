import {
  computed,
  getCurrentInstance,
  onMounted,
  reactive,
  useTemplateRef,
  watch,
} from "vue";
import { useElementBounding } from "@vueuse/core";
import { useStore } from "vuex";

// Cache for shared template refs to avoid duplicates
const templateRefCache = new Map<string, any>();

/**
 *
 * @param id ID to identify this step
 * @param refId ID placed on the element to be highlighted
 * @param title
 * @param description
 * @param location Position of the tooltip
 * @param onTourStep Callback when tour is at current step
 * @param onAfterTourStep Callback when tour leaves current step
 */
export function useTour<T>({
  id,
  refId,
  title,
  index,
  description,
  location,
  onTourStep,
  onAfterTourStep,
}: {
  id: string;
  refId: string;
  title: string;
  description: string;
  index?: number;
  location?: "top" | "bottom" | "start" | "end" | "center";
  onTourStep?: CallableFunction;
  onAfterTourStep?: CallableFunction;
}) {
  const instance = getCurrentInstance();
  if (instance) {
    const store = useStore();

    // Use cached template ref or create new one
    let tour = templateRefCache.get(refId);
    if (!tour) {
      tour = useTemplateRef<HTMLElement>(refId);
      templateRefCache.set(refId, tour);
    }

    const bounds = reactive(useElementBounding(tour));
    const isOnTour = computed(() => store.getters["tour/isOnTour"]);
    const isCurrentStep = computed(
      () => store.getters["tour/tourStepId"] === id,
    );

    watch(
      () => store.getters["tour/tourStepId"],
      () => {
        bounds.update();
      },
      { immediate: true },
    );
    watch(
      isCurrentStep,
      (isCurrentStep, prevVal) => {
        if (isCurrentStep && isOnTour.value) {
          onTourStep?.();
        }
        if (prevVal && !isCurrentStep && isOnTour.value) {
          onAfterTourStep?.();
        }
      },
      { immediate: true },
    );

    watch(
      isOnTour,
      (isOnTour, wasOnTour) => {
        if (wasOnTour && !isOnTour) {
          onAfterTourStep?.();
        }
      },
      { immediate: true },
    );
    onMounted(() => {
      store
        .dispatch("tour/addTourStep", {
          id,
          index,
          location,
          title,
          description,
          bounds,
        })
        .then(() => void 0);
    });
    return [isCurrentStep, tour];
  }
}
