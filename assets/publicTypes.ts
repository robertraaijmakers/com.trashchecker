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
  startdate?: Date;
  day: number;
}

export interface LabelSettings {
  timeindicator: number;
  generic: string;
  type: {
    GFT: string;
    REST: string;
    PMD: string;
    PLASTIC: string;
    PAPIER: string;
    TEXTIEL: string;
    GROF: string;
    GLAS: string;
    KERSTBOOM: string;
    NONE: string;
  };
}

export interface ApiSettings {
  apiId: string;
  cleanApiId: string;
  zipcode: string;
  housenumber: string;
  streetname: string;
  country: string;
}
