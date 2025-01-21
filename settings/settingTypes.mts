'use strict';

export const AllTrashTypes: string[] = ['GFT', 'PLASTIC', 'PAPIER', 'PMD', 'REST', 'TEXTIEL', 'GROF', 'KERSTBOOM', 'GLAS'];
export const AllTrashTypesExtended: string[] = ['GFT', 'PLASTIC', 'PAPIER', 'PMD', 'REST', 'TEXTIEL', 'GROF', 'KERSTBOOM', 'GLAS', 'NONE'];
export interface ManualAddition {
  [key: string]: Date[];
}

export const createManualAdditons = (): ManualAddition => ({
  GFT: [],
  REST: [],
  PAPIER: [],
  GROF: [],
  PLASTIC: [],
  PMD: [],
  TEXTIEL: [],
  KERSTBOOM: [],
});

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
