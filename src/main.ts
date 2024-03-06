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

const map = new WebMap({
  portalItem: {
    id: "41281c51f9de45edaf1c8ed44bb10e30",
  },
});

const view = new MapView({
  map,
  container: "viewDiv",
});

// Step 6: Create a LayerList instance

// Step 7: Watch for changes to the layer list's selected items

// Step 8: Watch for changes to the map's visible layers

// Step 9: Watch for changes to the view's ready, stationary, and updating properties

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
