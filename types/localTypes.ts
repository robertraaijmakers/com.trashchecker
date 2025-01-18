'use strict';

import Homey from 'homey/lib/Homey';
import { TrashApis } from '../lib/trashapis';
import { CleanApis } from '../lib/cleanapis';
import { TrashType } from '../assets/publicTypes';

export interface TrashCollectionReminder extends Homey.App {
  collectionDates: ActivityDates[];
  cleanDates: ActivityDates[];
  trashApis: TrashApis;
  cleanApis: CleanApis;
  recalculate: () => Promise<void>;
}

export type TrashArgumentType = TrashType | 'ANY';

export enum FlowCardType {
  CONDITION = 'condition',
  ACTION = 'action',
}

export enum When {
  today = 'today',
  tomorrow = 'tomorrow',
  datomorrow = 'datomorrow',
}

export interface ActivityDates {
  type: TrashType;
  icon?: string;
  color?: string;
  localText?: string;
  dates: Date[];
}

export interface ActivityItem {
  type: TrashType;
  icon?: string;
  color?: string;
  localText?: string;
  activityDate: Date;
}

export interface WidgetItem extends ActivityItem {
  isCleaned: boolean;
}

export interface TrashFlowCardArgument {
  trash_type: TrashArgumentType;
  when: When;
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

export interface WidgetSettings {
  displayYesterday: boolean;
  layoutType: 'compact' | 'large';
  maxItems: number;
  singleTypes: boolean;
  listHeight: number;
  displayTypes: Record<TrashType, boolean>;
}

export interface ApiSettings {
  apiId: string;
  cleanApiId: string;
  zipcode: string;
  housenumber: string;
  streetname: string;
  country: string;
}

export interface ApiDefinition {
  name: string;
  id: string;
  execute: (apiSettings: ApiSettings) => Promise<ActivityDates[]>;
}

export interface ApiFindResult {
  name: string;
  id: string;
  days: ActivityDates[];
}
