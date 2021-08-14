"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import powerbi from "powerbi-visuals-api";
import "./iridium.js"; // Load the visual module from parent directory!

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
  private mounted: boolean;
  private init_options: any;
  private update_options: any;
  private target: HTMLElement;
  private root: HTMLElement;
  private settings: VisualSettings;
  private Iridium: any;
  private IridiumMain: any;

  constructor(options: VisualConstructorOptions) {
    console.log("Visual constructor", options);
    this.init_options = options;
    this.target = options.element;
    this.mounted = false;
    this.Iridium = (window as any).Iridium;
    if (document) {
      const root: HTMLElement = document.createElement("div");
      this.root = root;
      root.style.overflow = "auto";
      root.style.height = "100%";
      this.Iridium.pbi = this;
      this.target.appendChild(root);
    }
  }

  private setPersist(props: any) {
    return this.init_options.host.persistProperties({
      merge: [
        {
          objectName: "chartSettings",
          selector: null,
          properties: { params: JSON.stringify(props) || "" },
        },
      ],
    });
  }

  public update(options: VisualUpdateOptions) {
    this.update_options = options;
    this.settings = Visual.parseSettings(
      options && options.dataViews && options.dataViews[0]
    );
    if (this.IridiumMain) {
      this.IridiumMain.redefine("options", options);
      this.IridiumMain.redefine(
        "dataView",
        options && options.dataViews && options.dataViews[0]
      );
    }
    const notebook_cells = JSON.parse(
      this.settings.chartSettings.params || "[]"
    );
    this.Iridium.get_recent = () => {
      return "Custom Visual";
    };
    this.Iridium.set_recent = () => {
      return true;
    };
    this.Iridium.ready = (main) => {
      this.IridiumMain = main;
      this.IridiumMain.define("options", options);
      this.IridiumMain.define(
        "dataView",
        options && options.dataViews && options.dataViews[0]
      );
    };
    this.Iridium.load = () => {
      return new Promise((yes, no) => {
        yes(notebook_cells);
      });
    };
    this.Iridium.save = (name, data) => {
      return new Promise((yes, no) => {
        yes(this.setPersist(data));
      });
    };
    console.log("Visual update", options);

    if (this.mounted === false) {
      this.mounted = true;
      (window as any).Iridium.render(
        (window as any).Iridium.html`<${
          (window as any).Iridium.IridiumApp
        } Ir=${(window as any).Iridium} />`,
        this.root
      );
    } else {
    }
  }

  private static parseSettings(dataView: DataView): VisualSettings {
    return <VisualSettings>VisualSettings.parse(dataView);
  }

  /**
   * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
   * objects and properties you want to expose to the users in the property pane.
   *
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    return VisualSettings.enumerateObjectInstances(
      this.settings || VisualSettings.getDefault(),
      options
    );
  }
}
