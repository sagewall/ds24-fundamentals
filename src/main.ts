import WebMap from "@arcgis/core/WebMap";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
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
  container: "layer-list-block",
  selectionMode: "multiple",
  view,
});

view.watch("stationary", (value) => {
  if (value === true) {
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

view.when(() => {
  const whenChip = document.querySelector("#when-chip") as HTMLCalciteChipElement;
  whenChip.icon = "check-circle";

  console.log("view.when() has resolved");
  const loadedLayersList = document.querySelector("#loaded-layers-list") as HTMLCalciteListElement;

  view.map.allLayers.forEach(async (layer) => {
    await layer.load();
    console.log(`${layer.title} has loaded`);
    const listItem = document.createElement("calcite-list-item");
    listItem.label = `${layer.title} has loaded`;
    listItem.value = `${layer.title} has loaded`;
    loadedLayersList.appendChild(listItem);
  });
});

reactiveUtils.watch(
  () => view.stationary,
  (stationary) => {
    const stationaryChip = document.querySelector("#stationary-chip") as HTMLCalciteChipElement;
    stationaryChip.icon = stationary ? "check-circle" : "circle";
    console.log(`stationary is ${stationary ? true : false}`);
  },
);

reactiveUtils.watch(
  () => view.ready,
  (ready) => {
    const readyChip = document.querySelector("#ready-chip") as HTMLCalciteChipElement;
    readyChip.icon = ready ? "check-circle" : "circle";
    console.log(`ready is ${ready ? true : false}`);
  },
);

reactiveUtils.watch(
  () => view.updating,
  (updating) => {
    const updatingChip = document.querySelector("#updating-chip") as HTMLCalciteChipElement;
    updatingChip.icon = updating ? "circle" : "check-circle";
    console.log(`updating is ${updating ? true : false}`);
  },
);

reactiveUtils.watch(
  () =>
    view.map.allLayers.map((layer) => {
      document.querySelector("#visible-layers-list")!.innerHTML = "";
      if (layer.visible) {
        return layer.title;
      }
    }),
  (titles) => {
    titles.forEach((title) => {
      if (title) {
        const listItem = document.createElement("calcite-list-item");
        listItem.label = title;
        listItem.value = title;
        document.querySelector("#visible-layers-list")!.appendChild(listItem);
      }
    });
  },
);

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
