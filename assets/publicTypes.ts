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

export const API_REGISTRY = [
  { name: 'Afval App', id: 'afa', country: 'NL', handler: 'afvalapp' },
  { name: 'Afvalkalender ACV', id: 'acv', country: 'NL', handler: 'acvAfvalkalender' },
  { name: 'Afvalkalender Almere', id: 'alm', country: 'NL', handler: 'almereAfvalkalender' },
  { name: 'Afvalkalender Alphen aan den Rijn', id: 'apn', country: 'NL', handler: 'afvalkalenderApn' },
  { name: 'Afvalkalender BAR', id: 'afbar', country: 'NL', handler: 'afvalkalenderBar' },
  { name: 'Afvalkalender Circulus-Berkel', id: 'acb', country: 'NL', handler: 'circulusBerkel' },
  { name: 'Afvalkalender Cyclus', id: 'afc', country: 'NL', handler: 'afvalkalenderCyclus' },
  { name: 'Afvalkalender DAR', id: 'dar', country: 'NL', handler: 'darAfvalkalender' },
  { name: 'Afvalkalender Etten-Leur', id: 'akel', country: 'NL', handler: 'huisvuilkalenderEttenLeur' },
  { name: 'Afvalkalender Irado', id: 'akird', country: 'NL', handler: 'afvalkalenderIrado' },
  { name: 'Afvalkalender Meerlanden', id: 'akm', country: 'NL', handler: 'afvalkalenderMeerlanden' },
  { name: 'Afvalkalender Noardeast-Fryslân', id: 'nfd', country: 'NL', handler: 'afvalkalenderNoordOostFriesland' },
  { name: 'Afvalkalender Omrin', id: 'akom', country: 'NL', handler: 'afvalkalenderOmrin' },
  { name: 'Afvalkalender Peel en Maas', id: 'akpm', country: 'NL', handler: 'afvalkalenderPeelEnMaas' },
  { name: 'Afvalkalender Purmerend', id: 'akpu', country: 'NL', handler: 'afvalkalenderPurmerend' },
  { name: 'Afvalkalender RAD', id: 'rad', country: 'NL', handler: 'afvalkalenderRad' },
  { name: 'Afvalkalender RD4', id: 'rd4', country: 'NL', handler: 'afvalkalenderRD4' },
  { name: 'Afvalkalender Reinis', id: 'aknw', country: 'NL', handler: 'reinis' },
  { name: 'Afvalkalender RMN', id: 'afrm', country: 'NL', handler: 'afvalRmn' },
  { name: 'Afvalkalender ROVA', id: 'rov', country: 'NL', handler: 'rovaAfvalkalender' },
  { name: 'Afvalkalender RWM', id: 'rwm', country: 'NL', handler: 'afvalkalenderRwm' },
  { name: 'Afvalkalender Saver', id: 'svr', country: 'NL', handler: 'afvalkalenderSaver' },
  { name: 'Afvalkalender Súdwest-Fryslân', id: 'swf', country: 'NL', handler: 'afvalkalenderSudwestFryslan' },
  { name: 'Afvalkalender Venlo', id: 'akvnl', country: 'NL', handler: 'afvalKalenderVenlo' },
  { name: 'Afvalkalender Venray', id: 'akvr', country: 'NL', handler: 'afvalkalenderVenray' },
  { name: 'Afvalkalender Westland', id: 'akwl', country: 'NL', handler: 'afvalKalenderWestland' },
  { name: 'Afvalkalender Woerden', id: 'akwrd', country: 'NL', handler: 'afvalKalenderWoerden' },
  { name: 'Afvalkalender ZRD', id: 'afzrd', country: 'NL', handler: 'afvalkalenderZrd' },
  { name: 'Avalwijzer Montferland', id: 'mont', country: 'NL', handler: 'afvalwijzerMontferland' },
  { name: 'Afvalwijzer Pre Zero', id: 'arn', country: 'NL', handler: 'afvalwijzerPreZero' },
  { name: 'Area Reiniging', id: 'arei', country: 'NL', handler: 'areaReiniging' },
  { name: 'Avalex', id: 'avx', country: 'NL', handler: 'afvalAvalex' },
  { name: 'Avri', id: 'avr', country: 'NL', handler: 'afvalkalenderAvri' },
  { name: 'Den Bosch Afvalstoffendienstkalender', id: 'dbafw', country: 'NL', handler: 'denBoschAfvalstoffendienstCalendar' },
  { name: 'GAD Gooi en Vechtstreek', id: 'gad', country: 'NL', handler: 'GadGooiAndVechtstreek' },
  { name: 'Gemeente Assen', id: 'gemas', country: 'NL', handler: 'afvalkalenderAssen' },
  { name: 'Gemeente Groningen', id: 'akgr', country: 'NL', handler: 'afvalkalenderGroningen' },
  { name: 'Gemeente Hellendoorn', id: 'geh', country: 'NL', handler: 'gemeenteHellendoorn' },
  { name: 'Gemeente Nijkerk', id: 'aknk', country: 'NL', handler: 'afvalkalenderNijkerk' },
  { name: 'Gemeente Meppel', id: 'gem', country: 'NL', handler: 'gemeenteMeppel' },
  { name: 'Huisvulkalender Den Haag', id: 'hkdh', country: 'NL', handler: 'huisvuilkalenderDenHaag' },
  { name: 'Inzamelkalender HVC', id: 'hvc', country: 'NL', handler: 'inzamelkalenderHVC' },
  { name: 'Klikomanager Oude IJsselstreek', id: 'kmoij', country: 'NL', handler: 'klikoManagerOudeIJsselstreek' },
  { name: 'Klikomanager Uithoorn', id: 'kmuit', country: 'NL', handler: 'klikoManagerUithoorn' },
  { name: 'Mijn Afvalwijzer', id: 'afw', country: 'NL', handler: 'mijnAfvalWijzer' },
  { name: 'Mijn Blink Afvalkalender', id: 'mba', country: 'NL', handler: 'BlinkAfvalkalender' },
  { name: 'Recyclemanager', id: 'remg', country: 'NL', handler: 'recycleManager' },
  { name: 'Reinigingsdienst Waardlanden', id: 'rewl', country: 'NL', handler: 'reinigingsdienstWaardlanden' },
  { name: 'Twente Milieu', id: 'twm', country: 'NL', handler: 'twenteMilieu' },

  { name: 'Afvalkalender Limburg.NET', id: 'aklbn', country: 'BE', handler: 'afvalkalenderLimburgNET' },
  { name: 'Recycle App', id: 'recbe', country: 'BE', handler: 'recycleApp' },
] as const;

export type RegistryItem = (typeof API_REGISTRY)[number];
export type HandlerKey = RegistryItem['handler']; // narrows to exact strings
