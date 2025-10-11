'use strict';

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

export const TrashColors = {
  GFT: '#3a9600',
  PLASTIC: '#ffa203',
  PAPIER: '#060367',
  PMD: '#ffa203',
  REST: '#787878',
  TEXTIEL: '#6c0014',
  GROF: '#292929',
  KERSTBOOM: '#59bd1b',
  GLAS: '#00cdae',
};

export type Country = 'NL' | 'BE';
export interface ApiMeta {
  name: string;
  id: string;
  country: Country;
  handler: string;
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
  cityname: string;
  country: string;
}
