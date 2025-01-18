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
