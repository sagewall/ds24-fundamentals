import WebMap from "@arcgis/core/WebMap";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import type ListItem from "@arcgis/core/widgets/LayerList/ListItem";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";
import "./style.css";

defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.4.0/assets",
});

const latitudeChip = document.querySelector("#latitude-chip") as HTMLCalciteChipElement;
const longitudeChip = document.querySelector("#longitude-chip") as HTMLCalciteChipElement;
const modalEl = document.querySelector("#modal") as HTMLCalciteModalElement;
const navigationEl = document.querySelector("#nav") as HTMLCalciteNavigationElement;
const panelEl = document.querySelector("#sheet-panel") as HTMLCalcitePanelElement;
const readyIcon = document.querySelector("#ready-icon") as HTMLCalciteIconElement;
const sheetEl = document.querySelector("#sheet") as HTMLCalciteSheetElement;
const stationaryIcon = document.querySelector("#stationary-icon") as HTMLCalciteIconElement;
const toggleModalEl = document.querySelector("#toggle-modal") as HTMLCalciteActionElement;
const updatingIcon = document.querySelector("#updating-icon") as HTMLCalciteIconElement;
const visibleLayersList = document.querySelector("#visible-layers-list") as HTMLCalciteListElement;
const zoomChip = document.querySelector("#zoom-chip") as HTMLCalciteChipElement;

setUpEventListeners();

// Step 3: Create a WebMap instance
const map = new WebMap({
  portalItem: {
    id: "41281c51f9de45edaf1c8ed44bb10e30",
  },
});

// Step 4: Create a MapView instance
const view = new MapView({
  map,
  container: "viewDiv",
});

// Step 5: Create a LayerList instance
const layerList = new LayerList({
  container: "layer-list-block",
  selectionMode: "multiple",
  view,
});

// Step 6: Watch for changes to the layer list's selected items
reactiveUtils.watch(
  () => layerList.selectedItems.toArray(),
  (newSelectedItems, oldSelectedItems) => {
    const added = newSelectedItems.filter((item) => !oldSelectedItems.includes(item));
    const removed = oldSelectedItems.filter((item) => !newSelectedItems.includes(item));
    removed.forEach((listItem) => applyFeatureEffect(listItem, "none"));
    added.forEach((listItem) => applyFeatureEffect(listItem, "drop-shadow(2px, 2px, 3px) saturate(300%)"));
  },
);

// Step 7: Watch for changes to the map's visible layers
reactiveUtils.watch(
  () =>
    view.map.layers
      .filter((layer) => layer.visible)
      .map((layer) => layer.title)
      .reverse(),
  (titles) => {
    if (!visibleLayersList) {
      console.warn('Element with id "visible-layers-list" not found');
      return;
    }
    visibleLayersList.innerHTML = "";
    titles.forEach((title) => {
      const listItem = document.createElement("calcite-list-item");
      listItem.label = title;
      listItem.value = title;
      visibleLayersList.appendChild(listItem);
    });
  },
);

// Step 8: Watch for changes to the view's ready, stationary, and updating properties
reactiveUtils.watch(
  () => view.ready,
  (ready) => {
    if (!readyIcon) {
      console.warn("Required elements not found");
      return;
    }

    console.log(`ready is ${ready}`);
    updateIcon(readyIcon, ready);
  },
  { initial: true },
);

reactiveUtils.watch(
  () => view.updating,
  (updating) => {
    if (!updatingIcon) {
      console.warn("Required elements not found");
      return;
    }

    console.log(`updating is ${updating}`);
    updateIcon(updatingIcon, updating, true);
  },
  { initial: true },
);

reactiveUtils.watch(
  () => view.stationary,
  (stationary) => {
    if (!latitudeChip || !longitudeChip || !stationaryIcon || !zoomChip) {
      console.warn("Required elements not found");
      return;
    }

    console.log(`stationary is ${stationary}`);
    updateIcon(stationaryIcon, stationary);

    zoomChip.innerHTML = `${view.zoom?.toFixed(0)}`;
    latitudeChip.innerHTML = `${view.center?.latitude.toFixed(3)}`;
    longitudeChip.innerHTML = `${view.center?.longitude.toFixed(3)}`;
  },
  { initial: true },
);

/**
 * A function to apply an effect to a list item layer if it is a feature layer
 *
 * @param listItem
 * @param effect
 */
function applyFeatureEffect(listItem: ListItem, effect: string) {
  const { layer } = listItem;
  if (layer.type === "feature") {
    (layer as FeatureLayer).effect = effect;
  }
}

/**
 * A function to set up the event listeners for the app
 */
function setUpEventListeners() {
  navigationEl?.addEventListener("calciteNavigationActionSelect", () => handleSheetOpen());
  panelEl?.addEventListener("calcitePanelClose", () => handlePanelClose());
  toggleModalEl?.addEventListener("click", () => handleModalChange());

  function handleModalChange() {
    if (modalEl) {
      modalEl.open = !modalEl.open;
    }
  }

  function handleSheetOpen() {
    sheetEl.open = true;
    panelEl.closed = false;
  }

  function handlePanelClose() {
    sheetEl.open = false;
  }
}

/**
 * A function to update the icon and text label of a calcite icon based on a boolean value
 *
 * @param calciteIcon
 * @parm falseIsExpected
 * @param value
 *
 */
function updateIcon(calciteIcon: HTMLCalciteIconElement, value: boolean, falseIsExpected: boolean = false) {
  const success = falseIsExpected ? !value : value;
  calciteIcon.icon = success ? "check-circle" : "x-circle";
  calciteIcon.textLabel = value?.toString();
  calciteIcon.style.setProperty(
    "--calcite-ui-icon-color",
    success ? "var(--calcite-color-status-success)" : "var(--calcite-color-status-danger)",
  );
}
