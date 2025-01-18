'use strict';

import type HomeySettings from 'homey/lib/HomeySettings.js';
import { ApiSettings, LabelSettings, TrashType } from '../assets/publicTypes.js';
import { AllTrashTypes, AllTrashTypesExtended, createManualAdditons } from './settingTypes.mjs';

class SettingScript {
  private homey: HomeySettings;

  constructor(homey: HomeySettings) {
    this.homey = homey;
  }

  public async onHomeyReady(): Promise<void> {
    // Register on change events of fields in settings page.
    document.getElementById('apiSave')?.addEventListener('click', () => this.save());
    document.getElementById('manualSettingsSave')?.addEventListener('click', () => this.saveManualInput(true));
    document.getElementById('labelInput')?.addEventListener('click', () => this.saveLabelInput());
    document.getElementById('saveManaulDataEntry')?.addEventListener('click', () => this.saveManualEntryDates());
    document.getElementById('refreshDebugInformation')?.addEventListener('click', () => this.retrieveCollectionDaysDebug(true));

    // Render type specific event listners
    for (let type in AllTrashTypes) {
      const typeLower = AllTrashTypes[type].toLowerCase();
      const typeUFirst = this.#capitalizeFirstLetter(typeLower);

      document.getElementById(`${typeLower}_option`)?.addEventListener('change', () => this.toggleManualInputFields(AllTrashTypes[type] as TrashType));
      document.getElementById(`${typeLower}_option_extension`)?.addEventListener('change', () => this.toggleManualInputFields(AllTrashTypes[type] as TrashType));
      document.getElementById(`label${typeUFirst}`)?.addEventListener('change', () => this.renderGlobalLabel());

      this.toggleManualInputFields(AllTrashTypes[type] as TrashType);
    }

    // Render other event listners
    document.getElementById('labelTimeIndicator')?.addEventListener('change', () => this.renderGlobalLabel());
    document.getElementById('labelNone')?.addEventListener('change', () => this.renderGlobalLabel());
    document.getElementById('labelGeneric')?.addEventListener('change', () => this.renderGlobalLabel());

    document.getElementById('country')?.addEventListener('change', () => this.toggleFieldsBasedOnCountry());

    // Output some loading details
    var respDates = document.getElementById('respDatesDebug') as HTMLInputElement;
    respDates.style.color = 'black';
    respDates.innerHTML = 'Loading collection days...';

    // Retrieve settings
    this.homey.get('apiSettings', (err: string, result: any) => this.handleGetApiSettings(err, result));
    this.homey.get('manualEntryData', (err: string, result: any) => this.handleGetManualInputSettings(err, result));
    this.homey.get('labelSettings', (err: string, result: any) => this.handleGetLabelSettings(err, result));
    this.homey.get('manualAdditions', (err: string, result: any) => this.handleGetManualAdditions(err, result));
    this.retrieveCollectionDaysDebug(false);

    // Set properties
    this.toggleFieldsBasedOnCountry();
    
    this.homey.ready();
  }

  async handleGetLabelSettings(err: string, labelSettings: LabelSettings) {
    console.log(labelSettings);

    this.setInputValue('labelTimeIndicator', labelSettings?.timeindicator || 0);
    this.setInputValue('labelGeneric', labelSettings?.generic || this.homey.__('tokens.output.trashtypeycollectedonx'));
    this.setPlaceholderValue('labelGeneric', this.homey.__('tokens.output.trashtypeycollectedonx'));

    // Loop over types    
    for (let type in AllTrashTypesExtended) {
      const trashType = AllTrashTypesExtended[type];
      let labelText = labelSettings?.type[trashType as TrashType | 'NONE'] || this.homey.__(`tokens.output.type.${trashType}`);

      var ucFirstType = this.#capitalizeFirstLetter(trashType);
      this.setInputValue(`label${ucFirstType}`, labelText);
      this.setPlaceholderValue(`label${ucFirstType}`, labelText);
    }

    this.renderGlobalLabel();
  }

  async handleGetManualInputSettings(err: string, manualEntryData: any) {
    console.log(manualEntryData);
    if (err) {
      return console.log(err);
    }

    for (let type in AllTrashTypes) {
      const trashType = AllTrashTypes[type];
      const values = manualEntryData[trashType];
      this.setInputValue(`${trashType.toLowerCase()}_option`, values?.option || 0);
      this.setInputValue(`${trashType.toLowerCase()}_dayofweek`, values?.day);
      this.setInputValue(`${trashType.toLowerCase()}_option_extension`, values?.option_extension);
      this.setInputValue(`${trashType.toLowerCase()}_startdate`, values?.startdate?.substring(0, 10));
      this.toggleManualInputFields(trashType as TrashType);
    }
  }

  async handleGetApiSettings(err: string, apiSettings: ApiSettings) {
    console.log(apiSettings);

    this.setInputValue('api', apiSettings?.apiId || '');
    this.setInputValue('cleanApi', apiSettings?.cleanApiId || '');
    this.setInputValue('postcode', apiSettings?.zipcode || '');
    this.setInputValue('number', apiSettings?.housenumber || '');
    this.setInputValue('streetname', apiSettings?.streetname || '');
    this.setInputValue('country', apiSettings?.country || 'NL');
  }

  async handleGetManualAdditions(err: string, manualAdditions: string) {
    if (err || manualAdditions === null) {
      this.setInputValue('manualDataEntry', JSON.stringify(createManualAdditons(), null, 2));
      return;
    }

    this.setInputValue('manualDataEntry', JSON.stringify(manualAdditions, null, 2));
  }

  async retrieveCollectionDaysDebug(recalculate: boolean) {
    var respDates = document.getElementById('respDatesDebug')!;
    respDates.innerHTML = 'Refreshing data...';

    this.homey.api('GET', `/trashcollectiondays?recalculate=${recalculate}`, (trashErr: string, collectionResult: any) => {
      if (trashErr) {
        respDates.innerHTML = trashErr;
        return;
      }

      if (collectionResult !== '') {
        respDates.innerHTML = '<pre>' + JSON.stringify(collectionResult, null, 2) + '</pre>';
      } else {
        respDates.innerHTML = 'No collection days found';
      }
    });
  }

  async save() {
    var resp = document.getElementById('resp')!;
    resp.style.color = 'black';
    resp.innerHTML = this.homey.__('settings.checking');

    var respDates = document.getElementById('respDates')!;
    respDates.style.color = 'black';
    respDates.innerHTML = '';

    var respDatesDebug = document.getElementById('respDatesDebug')!;
    respDatesDebug.innerHTML = 'Loading collection days...';

    // Always save the manual input when save button is pressed
    this.saveManualInput(false);

    const apiSettings = {
      zipcode: this.getInputValue('postcode') || null,
      housenumber: this.getInputValue('number') || null,
      streetname: this.getInputValue('streetname') || null,
      country: this.getInputValue('country') || null,
      apiId: this.getInputValue('api') || null,
      cleanApiId: this.getInputValue('cleanApi') || null,
    };

    if (apiSettings.zipcode == null && apiSettings.housenumber == null && apiSettings.streetname == null) {
      this.homey.set('apiSettings', apiSettings, this.#onSettingsSet);
      resp.innerHTML = this.homey.__('settings.manualonly');
      resp.style.color = 'green';
      this.retrieveCollectionDaysDebug(true);
      return;
    }

    this.homey.api('POST', '/trashcollection', apiSettings, (trashErr: string, trashResult: any) => {
      if (trashErr) {
        return console.log(trashErr);
      }

      if (trashResult.id === '') {
        resp.innerHTML = this.homey.__('settings.fail');
        resp.style.color = 'red';
        this.retrieveCollectionDaysDebug(false);
        return;
      }

      resp.style.color = 'green';
      resp.innerHTML = `${this.homey.__('settings.update')}: ${apiSettings.zipcode}, ${apiSettings.housenumber}`;
      this.setInputValue('api', trashResult.id);

      apiSettings.apiId = trashResult.id;
      this.homey.set('apiSettings', apiSettings, this.#onSettingsSet);
      this.retrieveCollectionDaysDebug(false);

      this.homey.api('POST', '/clean', apiSettings, (cleanError: string, cleanResult: any) => {
        if (cleanError) {
          return console.log(cleanError);
        }

        if (cleanResult.id === '') {
          apiSettings.cleanApiId = 'not-applicable';
        } else {
          apiSettings.cleanApiId = cleanResult.id;
        }

        this.setInputValue('cleanApi', apiSettings.cleanApiId || 'not-applicable');
        this.homey.set('apiSettings', apiSettings, this.#onSettingsSet);
      });
    });
  }

  async saveManualInput(refreshData: boolean) {
    const data: { [key: string]: any } = {};

    for (let type in AllTrashTypes) {
      const trashType = AllTrashTypes[type];
      if ((this.getInputValue(`${trashType.toLowerCase()}_option`) || 0) == 0) {
        continue;
      }

      data[trashType] = {};
      data[trashType].option = this.getInputValue(`${trashType.toLowerCase()}_option`);
      data[trashType].startdate = this.getInputValue(`${trashType.toLowerCase()}_startdate`);
      data[trashType].day = this.getInputValue(`${trashType.toLowerCase()}_dayofweek`);

      if (data[trashType].option >= 10) {
        data[trashType].option_extension = this.getInputValue(`${trashType.toLowerCase()}_option_extension`);
      } else {
        data[trashType].option_extension = -1;
      }
    }

    console.log(data);
    this.homey.set('manualEntryData', data, this.#onSettingsSet);

    if (refreshData) {
      this.retrieveCollectionDaysDebug(true);
    }
  }

  async saveManualEntryDates() {
    var data = createManualAdditons();

    var textualInput = {};

    try {
      textualInput = JSON.parse(this.getInputValue('manualDataEntry') ?? '{}');
    } catch (err: any) {
      document.getElementById('respManualDataEntry')!.innerHTML = err;
      return;
    }

    document.getElementById('respManualDataEntry')!.innerHTML = '';
    for (let type in AllTrashTypes) {
      const trashType = AllTrashTypes[type];
      data[trashType] = await this.validateManualEntryDates(textualInput, trashType as TrashType);
    }

    this.homey.set('manualAdditions', data, this.#onSettingsSet);

    // We trigger a full save, to make sure everything is recalculated (a bit heavy, but this feature shouldn't be used that often)
    await this.save();
    await this.saveLabelInput();

    // Retrieve them again & update field (for formatting & feedback purposes)
    this.homey.get('manualAdditions', (err: string, result: any) => this.handleGetManualAdditions(err, result));
  }

  async saveLabelInput() {
    var data = {
      timeindicator: this.getInputValue('labelTimeIndicator'),
      generic: this.getInputValue('labelGeneric'),
      type: {
        GFT: this.getInputValue('labelGft'),
        REST: this.getInputValue('labelRest'),
        PMD: this.getInputValue('labelPmd'),
        PLASTIC: this.getInputValue('labelPlastic'),
        PAPIER: this.getInputValue('labelPapier'),
        TEXTIEL: this.getInputValue('labelTextiel'),
        GROF: this.getInputValue('labelGrof'),
        GLAS: this.getInputValue('labelGlas'),
        KERSTBOOM: this.getInputValue('labelKerstboom'),
        NONE: this.getInputValue('labelNone'),
      },
    };

    console.log(data);
    this.homey.set('labelSettings', data, this.#onSettingsSet);
  }

  async renderGlobalLabel() {
    var sentence = '<i>Example: ' + this.getInputValue('labelGeneric') + '</i>';
    var timeReplacement = this.homey.__('tokens.output.timeindicator.t' + this.getInputValue('labelTimeIndicator'));
    var replacementSingle = this.homey.__('tokens.output.replacementsingle');
    var replacementPlural = this.homey.__('tokens.output.replacementplural');

    const types = AllTrashTypesExtended;
    for (var i = 0; i < types.length; i += 1) {
      var typeReplacement = this.getInputValue(`label${this.#capitalizeFirstLetter(types[i])}`) ?? '';
      document.getElementById(`example${this.#capitalizeFirstLetter(types[i])}`)!.innerHTML = sentence
        .replace('__time__', timeReplacement)
        .replace('__type__', typeReplacement)
        .replace('__plural__', replacementSingle);
    }

    var multipleTypesReplacement = this.getInputValue(`labelGft`) + ', ' + this.getInputValue(`labelPlastic`) + ' ' + this.homey.__('tokens.output.and') + ' ' + this.getInputValue(`labelGrof`);
    document.getElementById('exampleMultiple')!.innerHTML = sentence.replace('__time__', timeReplacement).replace('__type__', multipleTypesReplacement).replace('__plural__', replacementPlural);
  }

  async toggleManualInputFields(type: TrashType) {
    const prefix = type.toLowerCase();

    if (type === 'KERSTBOOM') return; // We don't have settings for kerstbomen

    const value = (this.getInputValue(`${prefix}_option`) ?? 0) as number;
    const optionExtensionValue = (this.getInputValue(`${prefix}_option_extension`) ?? -1) as number;

    if (value >= 11) {
      document.getElementById(`${prefix}_option_extension`)!.style.display = 'block';
      document.getElementById(`${prefix}_day_div`)!.style.display = 'block';

      if (optionExtensionValue == 2) {
        document.getElementById(`${prefix}_startdate_div`)!.style.display = 'block';
      } else {
        document.getElementById(`${prefix}_startdate_div`)!.style.display = 'none';
      }
    } else if (value == 1) {
      document.getElementById(`${prefix}_option_extension`)!.style.display = 'none';
      document.getElementById(`${prefix}_startdate_div`)!.style.display = 'none';
      document.getElementById(`${prefix}_day_div`)!.style.display = 'block';
    } else if (value == 0 || value == -1) {
      document.getElementById(`${prefix}_option_extension`)!.style.display = 'none';
      document.getElementById(`${prefix}_startdate_div`)!.style.display = 'none';
      document.getElementById(`${prefix}_day_div`)!.style.display = 'none';
    } else {
      document.getElementById(`${prefix}_option_extension`)!.style.display = 'none';
      document.getElementById(`${prefix}_startdate_div`)!.style.display = 'block';
      document.getElementById(`${prefix}_day_div`)!.style.display = 'block';
    }
  }

  async toggleFieldsBasedOnCountry() {
    const countrySelected = this.getInputValue('country') ?? 'NL';
    if (countrySelected === 'NL') {
      document.getElementById('streetname_div')!.style.display = 'none';
    } else if (countrySelected === 'BE') {
      document.getElementById('streetname_div')!.style.display = 'block';
    }
  }

  async validateManualEntryDates(input: any, trashType: TrashType) {
    let output: Date[] = [];
    if (!input || !input?.[trashType]) {
      return output;
    }

    for (var i = 0; i < input?.[trashType].length; i++) {
      try {
        const validDate = new Date(input?.[trashType][i]);
        output.push(validDate);
      } catch (err: any) {
        console.log(`Couldn't parse ${input?.[trashType][i]} to a valid date.`);
      }
    }

    return output;
  }

  setInputValue(id: string, value: string | number | undefined) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.value = value?.toString() || '';
    }
  }

  setPlaceholderValue(id: string, value: string | number | undefined) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.placeholder = value?.toString() || '';
    }
  }

  getInputValue(id: string) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      return input.value;
    }

    return null;
  }

  #capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }

  #onSettingsSet(error: string, result: any) {
    if (error) {
      console.log('Error updating settings in Homey: ', error);
      return;
    }

    console.log('Settings updated in Homey', result);
  }
}

window.onHomeyReady = async (homey: any): Promise<void> => await new SettingScript(homey).onHomeyReady();
