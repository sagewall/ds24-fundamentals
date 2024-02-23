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

setUp();

const map = new WebMap({
  portalItem: {
    id: "41281c51f9de45edaf1c8ed44bb10e30",
  },
});

const view = new MapView({
  map,
  container: "viewDiv",
});

const layerList = new LayerList({
  container: "layer-list-block",
  selectionMode: "multiple",
  view,
});

view.watch("stationary", (value) => {
  if (value === true) {
    const zoomChip = document.querySelector("#zoom-chip") as HTMLCalciteChipElement;
    const latitudeChip = document.querySelector("#latitude-chip") as HTMLCalciteChipElement;
    const longitudeChip = document.querySelector("#longitude-chip") as HTMLCalciteChipElement;

    if (!zoomChip || !latitudeChip || !longitudeChip) {
      console.warn("Required elements not found");
      return;
    }

    zoomChip.innerHTML = `${view.zoom?.toFixed(0)}`;
    latitudeChip.innerHTML = `${view.center?.latitude.toFixed(3)}`;
    longitudeChip.innerHTML = `${view.center?.longitude.toFixed(3)}`;
  }
});

layerList.selectedItems.on("change", (event) => {
  const { removed, added } = event;
  removed.forEach((listItem) => applyFeatureEffect(listItem, "none"));
  added.forEach((listItem) => applyFeatureEffect(listItem, "drop-shadow(2px, 2px, 3px) saturate(300%)"));
});

reactiveUtils.watch(
  () => view.ready,
  (ready) => {
    const readyIcon = document.querySelector("#ready-icon") as HTMLCalciteIconElement;
    if (readyIcon) {
      readyIcon.icon = ready ? "check-circle" : "x-circle";
      readyIcon.textLabel = ready.toString();
      readyIcon.style.setProperty(
        "--calcite-ui-icon-color",
        ready ? "var(--calcite-color-status-success)" : "var(--calcite-color-status-danger)",
      );
      console.log(`ready is ${ready}`);
    } else {
      console.warn('Element with id "ready-chip" not found');
    }
  },
);

reactiveUtils.watch(
  () => view.stationary,
  (stationary) => {
    const stationaryIcon = document.querySelector("#stationary-icon") as HTMLCalciteIconElement;
    if (stationaryIcon) {
      stationaryIcon.icon = stationary ? "check-circle" : "x-circle";
      stationaryIcon.textLabel = stationary.toString();
      stationaryIcon.style.setProperty(
        "--calcite-ui-icon-color",
        stationary ? "var(--calcite-color-status-success)" : "var(--calcite-color-status-danger)",
      );
      console.log(`stationary is ${stationary}`);
    } else {
      console.warn('Element with id "stationary-chip" not found');
    }
  },
);

reactiveUtils.watch(
  () => view.updating,
  (updating) => {
    const updatingIcon = document.querySelector("#updating-icon") as HTMLCalciteIconElement;
    if (updatingIcon) {
      updatingIcon.icon = !updating ? "check-circle" : "x-circle";
      updatingIcon.textLabel = updating.toString();
      updatingIcon.style.setProperty(
        "--calcite-ui-icon-color",
        !updating ? "var(--calcite-color-status-success)" : "var(--calcite-color-status-danger)",
      );
      console.log(`updating is ${updating}`);
    } else {
      console.warn('Element with id "updating-chip" not found');
    }
  },
);

reactiveUtils.watch(
  () =>
    view.map.layers
      .filter((layer) => layer.visible)
      .map((layer) => layer.title)
      .reverse(),
  (titles) => {
    const visibleLayersList = document.querySelector("#visible-layers-list");
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
function setUp() {
  const toggleModalEl = document.getElementById("toggle-modal") as HTMLCalciteActionElement;
  const navigationEl = document.getElementById("nav") as HTMLCalciteNavigationElement;
  const panelEl = document.getElementById("sheet-panel") as HTMLCalcitePanelElement;
  const modalEl = document.getElementById("modal") as HTMLCalciteModalElement;
  const sheetEl = document.getElementById("sheet") as HTMLCalciteSheetElement;

  toggleModalEl?.addEventListener("click", () => handleModalChange());
  navigationEl?.addEventListener("calciteNavigationActionSelect", () => handleSheetOpen());

  panelEl?.addEventListener("calcitePanelClose", () => handlePanelClose());

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
