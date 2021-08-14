"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public chartSettings: paramSettings = new paramSettings();
}

export class paramSettings {
  // Default params
  public params: string = "";
}
