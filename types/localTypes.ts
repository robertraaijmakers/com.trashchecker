'use strict';

import Homey from 'homey/lib/Homey';
import { TrashApis } from '../lib/trashapis';
import { CleanApis } from '../lib/cleanapis';
import { ApiSettings, TrashType } from '../assets/publicTypes';

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
  settingText?: string;
  settingIcon?: string;
  settingColor?: string;
}

export interface TrashFlowCardArgument {
  trash_type: TrashArgumentType;
  when: When;
}

export interface WidgetSettings {
  displayYesterday: boolean;
  layoutType: 'compact' | 'large';
  maxItems: number;
  singleTypes: boolean;
  listHeight: number;
  highlightTile: 'today' | 'tomorrow' | 'today-tomorrow' | 'none' | 'always';
  displayRule: 'settings' | 'settings-icons' | 'settings-iconscolors' | 'trashprovider';
}

export interface ApiDefinition {
  name: string;
  id: string;
  country: string;
  execute: (apiSettings: ApiSettings) => Promise<ActivityDates[]>;
}

export interface ApiFindResult {
  name: string;
  id: string;
  days: ActivityDates[];
}
