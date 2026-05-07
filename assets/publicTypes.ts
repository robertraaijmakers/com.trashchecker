'use strict';

export enum TrashType {
  GFT = 'GFT',
  GLAS = 'GLAS',
  GROF = 'GROF',
  KCA = 'KCA',
  PAPIER = 'PAPIER',
  PLASTIC = 'PLASTIC',
  PMD = 'PMD',
  REST = 'REST',
  SNOEI = 'SNOEI',
  TEXTIEL = 'TEXTIEL',
  KERSTBOOM = 'KERSTBOOM',
}

export const TrashColors = {
  GFT: '#3a9600',
  GLAS: '#00cdae',
  GROF: '#292929',
  KCA: '#800080',
  PAPIER: '#060367',
  PLASTIC: '#ffa203',
  PMD: '#ffa203',
  REST: '#787878',
  SNOEI: '#452200',
  TEXTIEL: '#6c0014',
  KERSTBOOM: '#59bd1b',
};

export type Country = 'NL' | 'BE' | 'NO';
export interface ApiMeta {
  name: string;
  id: string;
  country: Country;
  handler: string;
}

export interface ManualSettings {
  GFT: ManualSetting;
  GLAS: ManualSetting;
  GROF: ManualSetting;
  KCA: ManualSetting;
  PAPIER: ManualSetting;
  PLASTIC: ManualSetting;
  PMD: ManualSetting;
  REST: ManualSetting;
  SNOEI: ManualSetting;
  TEXTIEL: ManualSetting;
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
  GLAS?: LabelSetting;
  GROF?: LabelSetting;
  KCA?: LabelSetting;
  PAPIER?: LabelSetting;
  PLASTIC?: LabelSetting;
  PMD?: LabelSetting;
  REST?: LabelSetting;
  SNOEI?: LabelSetting;
  TEXTIEL?: LabelSetting;
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
  countyId?: string;
  apiKey?: string;
}
