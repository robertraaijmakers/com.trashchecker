'use strict';

import HomeySettings from 'homey/lib/HomeySettings';
import HomeyWidget from 'homey/lib/HomeyWidget';

// Declaring interface for widgets & settings
declare global {
  interface Window {
    onHomeyReady: (homey: HomeySettings | HomeyWidget) => Promise<void>;
  }
}

export enum TrashType {
  GFT = 'GFT',
  PLASTIC = 'PLASTIC',
  PAPIER = 'PAPIER',
  PMD = 'PMD',
  REST = 'REST',
  TEXTIEL = 'TEXTIEL',
  GROF = 'GROF',
  KERSTBOOM = 'KERSTBOOM',
  GLAS = 'GLAS',
}

export interface ManualSettings {
  GFT: ManualSetting;
  PLASTIC: ManualSetting;
  PAPIER: ManualSetting;
  PMD: ManualSetting;
  REST: ManualSetting;
  TEXTIEL: ManualSetting;
  GROF: ManualSetting;
  GLAS: ManualSetting;
}

export interface ManualSetting {
  option: number;
  option_extension?: number;
  startdate?: string;
  day: number;
}

export interface LabelSettings {
  timeindicator: number;
  generic: string;
  GFT?: LabelSetting;
  REST?: LabelSetting;
  PMD?: LabelSetting;
  PLASTIC?: LabelSetting;
  PAPIER?: LabelSetting;
  TEXTIEL?: LabelSetting;
  GROF?: LabelSetting;
  GLAS?: LabelSetting;
  KERSTBOOM?: LabelSetting;
  NONE?: LabelSetting;
}

export interface LabelSetting {
  trashLong?: string;
  trashShort?: string;
  trashIcon?: string;
  trashColor?: string;
}

export interface ApiSettings {
  apiId: string;
  cleanApiId: string;
  zipcode: string;
  housenumber: string;
  streetname: string;
  country: string;
}
