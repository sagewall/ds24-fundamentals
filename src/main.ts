import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";
import "./style.css";

defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.4.0/assets",
});

setUp();

const map = new WebMap({
  portalItem: {
    id: "bbf8d7ab9d0e45798fc186b7ceb9b3ed",
  },
});

const view = new MapView({
  map,
  center: [-105, 39],
  container: "viewDiv",
  zoom: 7,
});

const layerList = new LayerList({
  container: "layer-list-panel",
  selectionMode: "multiple",
  view,
  visibleElements: {
    collapseButton: true,
    heading: true,
  },
});

view.watch("stationary", (newValue, oldValue) => {
  console.log(`the stationary property changed from ${oldValue}, to ${newValue}`);

  if (newValue === true) {
    document.querySelector("#zoom-chip")!.innerHTML = `${view.zoom.toFixed(0)}`;
    document.querySelector("#latitude-chip")!.innerHTML = `${view.center.latitude.toFixed(3)}`;
    document.querySelector("#longitude-chip")!.innerHTML = `${view.center.longitude.toFixed(3)}`;
  }
});

layerList.selectedItems.on("change", (event) => {
  const { removed, added } = event;
  removed.forEach((item) => {
    const { layer } = item;
    if (layer instanceof FeatureLayer) {
      layer.effect = "none";
    }
  });
  added.forEach((item) => {
    const { layer } = item;
    if (layer instanceof FeatureLayer) {
      layer.effect = "drop-shadow(2px, 2px, 3px) saturate(300%)";
    }
  });
});

// Set up the user interface
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
