'use strict';

import type HomeySettings from 'homey/lib/HomeySettings.js';
import { ApiField, ApiMeta, ApiSettings, LabelSettings, ManualSetting, TrashType } from '../assets/publicTypes.js';
import { AllTrashTypes, AllTrashTypesExtended, createManualAdditons, TrashColors } from './settingTypes.mjs';

class SettingScript {
  private homey: HomeySettings;
  private iconCache: { [key in TrashType]: string };
  apiRegistry: ApiMeta[];

  constructor(homey: HomeySettings) {
    this.homey = homey;
    this.iconCache = {
      GFT: '',
      KCA: '',
      PLASTIC: '',
      PAPIER: '',
      PMD: '',
      REST: '',
      SNOEI: '',
      TEXTIEL: '',
      GROF: '',
      KERSTBOOM: '',
      GLAS: '',
    };

    this.apiRegistry = {} as ApiMeta[];
  }

  public async onHomeyReady(): Promise<void> {
    // Register on change events of fields in settings page.
    document.getElementById('apiSave')?.addEventListener('click', () => this.save());
    document.getElementById('manualSettingsSave')?.addEventListener('click', () => this.saveManualInput(true));
    document.getElementById('labelInput')?.addEventListener('click', () => this.saveLabelInput());
    document.getElementById('saveManaulDataEntry')?.addEventListener('click', () => this.saveManualEntryDates());
    document.getElementById('saveManualDataRemove')?.addEventListener('click', () => this.saveManualRemovalDates());
    document.getElementById('refreshDebugInformation')?.addEventListener('click', () => this.retrieveCollectionDaysDebug(true));

    // Await fetch and parse JSON
    this.apiRegistry = await (await fetch('../assets/api-registry.json')).json();

    console.log(this.apiRegistry);

    // Render type specific event listners
    for (let type in AllTrashTypes) {
      const typeLower = AllTrashTypes[type].toLowerCase();
      const typeUFirst = this.#capitalizeFirstLetter(typeLower);

      document.getElementById(`${typeLower}_option`)?.addEventListener('change', () => this.toggleManualInputFields(AllTrashTypes[type] as TrashType));
      document.getElementById(`${typeLower}_option_extension`)?.addEventListener('change', () => this.toggleManualInputFields(AllTrashTypes[type] as TrashType));
      document.getElementById(`${typeLower}_dayofweek`)?.addEventListener('change', () => this.toggleManualInputFields(AllTrashTypes[type] as TrashType));
      this.renderExtraDays(typeLower);
      this.renderPeriods(typeLower);

      document.getElementById(`label${typeUFirst}`)?.addEventListener('change', () => this.renderGlobalLabel());
      document.getElementById(`labelSmall${typeUFirst}`)?.addEventListener('change', () => this.renderWidgetLabel(typeUFirst));
      document.getElementById(`widgetColor${typeUFirst}`)?.addEventListener('change', () => this.renderWidgetLabel(typeUFirst));
      document.getElementById(`widgetIcon${typeUFirst}`)?.addEventListener('change', () => this.renderWidgetLabel(typeUFirst));
      document.getElementById(`widgetIconButton${typeUFirst}`)?.addEventListener('click', () => this.resetWidgetLabel(AllTrashTypes[type]));

      this.toggleManualInputFields(AllTrashTypes[type] as TrashType);
    }

    // Render other event listners
    document.getElementById('labelTimeIndicator')?.addEventListener('change', () => this.renderGlobalLabel());
    document.getElementById('labelNone')?.addEventListener('change', () => this.renderGlobalLabel());
    document.getElementById('labelGeneric')?.addEventListener('change', () => this.renderGlobalLabel());

    document.getElementById('country')?.addEventListener('change', () => this.toggleFieldsBasedOnCountry());
    document.getElementById('api')?.addEventListener('change', () => this.toggleFieldsBasedOnSelectedProvider());
    this.makeSearchableSelect(document.getElementById('api') as HTMLSelectElement);

    // Output some loading details
    var respDates = document.getElementById('respDatesDebug') as HTMLInputElement;
    respDates.style.color = 'black';
    respDates.innerHTML = 'Loading collection days...';

    // Retrieve settings
    this.homey.get('apiSettingsList', (err: string, result: any) => this.handleGetApiSettingsList(err, result));
    this.homey.get('apiSettings', (err: string, result: any) => this.handleGetApiSettingsFallback(err, result));
    this.homey.get('manualEntryData', (err: string, result: any) => this.handleGetManualInputSettings(err, result));
    this.homey.get('labelSettings', (err: string, result: any) => this.handleGetLabelSettings(err, result));
    this.homey.get('manualAdditions', (err: string, result: any) => this.handleGetManualAdditions(err, result));
    this.homey.get('manualRemovals', (err: string, result: any) => this.handleGetManualRemovals(err, result));
    this.retrieveCollectionDaysDebug(false);

    // Set properties
    this.toggleFieldsBasedOnCountry();

    this.homey.ready();
  }

  async handleGetLabelSettings(err: string, labelSettings: LabelSettings) {
    console.log(labelSettings);

    // Replacement of __types__ with __type__ to be backwards compatible and migrate everybody to the __type__ replacement
    this.setInputValue('labelTimeIndicator', labelSettings?.timeindicator || 0);
    this.setInputValue('labelGeneric', labelSettings?.generic?.replace('__types__', '__type__') || this.homey.__('tokens.output.trashtypeycollectedonx'));
    this.setPlaceholderValue('labelGeneric', this.homey.__('tokens.output.trashtypeycollectedonx'));

    // Loop over types
    for (let type in AllTrashTypesExtended) {
      const trashType = AllTrashTypesExtended[type];
      const trashSettings = labelSettings?.[trashType as TrashType | 'NONE'];

      let labelText = trashSettings?.trashLong || this.homey.__(`tokens.output.type.${trashType}`);

      var ucFirstType = this.#capitalizeFirstLetter(trashType);
      this.setInputValue(`label${ucFirstType}`, labelText);
      this.setPlaceholderValue(`label${ucFirstType}`, this.homey.__(`tokens.output.type.${trashType}`));

      // Check if element exist, otherwise skip
      const trashDateTitle = document.getElementById(`trashDateTitle${ucFirstType}`);
      if (trashDateTitle === null) continue;
      this.setWidgetLabel(trashType, trashSettings?.trashShort || '', trashSettings?.trashColor || '', trashSettings?.trashIcon || '');
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
      this.setExtraDays(trashType.toLowerCase(), values?.extra_days ?? []);
      this.setPeriods(trashType.toLowerCase(), values);
      this.toggleManualInputFields(trashType as TrashType);
    }
  }

  async handleGetApiSettings(err: string, apiSettings: ApiSettings) {
    console.log(apiSettings);

    // The provider list depends on the country, so fill that first.
    this.setInputValue('country', apiSettings?.country || 'NL');
    this.fillApis(apiSettings?.country || 'NL');
    this.setInputValue('api', apiSettings?.apiId || '');
    this.setInputValue('cleanApi', apiSettings?.cleanApiId || '');
    this.setInputValue('postcode', apiSettings?.zipcode?.toUpperCase() || '');
    this.setInputValue('number', apiSettings?.housenumber || '');
    this.setInputValue('streetname', apiSettings?.streetname || '');
    this.setInputValue('cityname', apiSettings?.cityname || '');
    this.setInputValue('country', apiSettings?.country || 'NL');
    this.setInputValue('externalId', apiSettings?.externalId || '');
    this.setInputValue('countyId', apiSettings?.countyId || '');
    this.setInputValue('apiKey', apiSettings?.apiKey || '');
    this.setInputValue('dl-api-input', (document.getElementById('api') as HTMLSelectElement).selectedOptions[0]?.text || '');

    this.toggleFieldsBasedOnSelectedProvider();
  }

  async handleGetApiSettingsList(err: string, apiSettingsList: ApiSettings[]) {
    if (err || !Array.isArray(apiSettingsList) || apiSettingsList.length === 0) {
      return;
    }

    await this.handleGetApiSettings(err, apiSettingsList[0]);
  }

  async handleGetApiSettingsFallback(err: string, apiSettings: ApiSettings) {
    this.homey.get('apiSettingsList', async (listError: string, apiSettingsList: ApiSettings[]) => {
      if (!listError && Array.isArray(apiSettingsList) && apiSettingsList.length > 0) {
        return;
      }

      await this.handleGetApiSettings(err, apiSettings);
    });
  }

  // Resolves once apiSettingsList is persisted, so a recalculation afterwards uses the new provider.
  private updatePrimaryApiSettings(apiSettings: ApiSettings): Promise<void> {
    this.homey.set('apiSettings', apiSettings, this.#onSettingsSet);

    return new Promise((resolve) => {
      this.homey.get('apiSettingsList', (err: string, currentList: ApiSettings[]) => {
        const list = Array.isArray(currentList) ? currentList : [];
        if (list.length > 0) {
          list[0] = apiSettings;
        } else {
          list.push(apiSettings);
        }

        this.homey.set('apiSettingsList', list, (error: string, result: any) => {
          this.#onSettingsSet(error, result);
          resolve();
        });
      });
    });
  }

  async handleGetManualAdditions(err: string, manualAdditions: string) {
    if (err || manualAdditions === null) {
      this.setInputValue('manualDataEntry', JSON.stringify(createManualAdditons(), null, 2));
      return;
    }

    this.setInputValue('manualDataEntry', JSON.stringify(manualAdditions, null, 2));
  }

  async handleGetManualRemovals(err: string, manualRemovals: string) {
    if (err || manualRemovals === null) {
      this.setInputValue('manualDataRemove', JSON.stringify(createManualAdditons(), null, 2));
      return;
    }

    this.setInputValue('manualDataRemove', JSON.stringify(manualRemovals, null, 2));
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
      zipcode: this.getInputValue('postcode')?.toUpperCase()?.replace(' ', '') || null,
      housenumber: this.getInputValue('number') || null,
      streetname: this.getInputValue('streetname') || null,
      cityname: this.getInputValue('cityname') || null,
      country: this.getInputValue('country') || null,
      apiId: this.getInputValue('api') || null,
      cleanApiId: this.getInputValue('cleanApi') || null,
      externalId: this.getInputValue('externalId') || undefined,
      countyId: this.getInputValue('countyId') || undefined,
      apiKey: this.getInputValue('apiKey') || undefined,
    };

    if (apiSettings.zipcode == null && apiSettings.housenumber == null && apiSettings.streetname == null && apiSettings.externalId == null) {
      await this.updatePrimaryApiSettings(apiSettings as ApiSettings);
      resp.innerHTML = this.homey.__('settings.manualonly');
      resp.style.color = 'green';
      this.retrieveCollectionDaysDebug(true);
      return;
    }

    this.homey.api('POST', '/trashcollection', apiSettings, (trashErr: string, trashResult: any) => {
      if (trashErr) {
        return console.log(trashErr);
      }

      console.log('Incoming results!', trashResult);

      if (trashResult.id === '') {
        resp.innerHTML = this.homey.__('settings.fail');
        resp.style.color = 'red';
        this.retrieveCollectionDaysDebug(false);
        return;
      }

      resp.style.color = 'green';
      const values = [apiSettings.zipcode, apiSettings.streetname, apiSettings.housenumber, apiSettings.cityname, apiSettings.externalId].filter((v) => v && String(v).trim() !== '');

      resp.innerHTML = `${this.homey.__('settings.update')}: ${values.join(', ')}`;
      this.setInputValue('api', trashResult.id);
      this.setInputValue('dl-api-input', (document.getElementById('api') as HTMLSelectElement).selectedOptions[0]?.text || '');

      apiSettings.apiId = trashResult.id;

      this.homey.api('POST', '/clean', apiSettings, async (cleanError: string, cleanResult: any) => {
        if (cleanError) {
          console.log(cleanError);
        } else if (cleanResult.id === '') {
          apiSettings.cleanApiId = 'not-applicable';
        } else {
          apiSettings.cleanApiId = cleanResult.id;
        }

        this.setInputValue('cleanApi', apiSettings.cleanApiId || 'not-applicable');
        await this.updatePrimaryApiSettings(apiSettings as ApiSettings);

        // Rebuild the app's in-memory dates from the new provider; otherwise the previous
        // provider's types stay in tokens, flows, devices and widgets until the next 48h refresh.
        this.retrieveCollectionDaysDebug(true);
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

      const extraDays = this.getExtraDays(trashType.toLowerCase()).filter((day) => day !== Number(data[trashType].day));
      if (data[trashType].option <= 8 && extraDays.length > 0) {
        data[trashType].extra_days = extraDays;
      }

      if (data[trashType].option <= 8) {
        Object.assign(data[trashType], this.getPeriods(trashType.toLowerCase()));
      }
    }

    console.log(data);
    this.homey.set('manualEntryData', data, this.#onSettingsSet);

    if (refreshData) {
      this.retrieveCollectionDaysDebug(true);
    }
  }

  async saveManualEntryDates() {
    await this.saveManualDateConfig({
      inputId: 'manualDataEntry',
      responseId: 'respManualDataEntry',
      settingsKey: 'manualAdditions',
      refresh: (err: string, result: any) => this.handleGetManualAdditions(err, result),
    });
  }

  async saveManualRemovalDates() {
    await this.saveManualDateConfig({
      inputId: 'manualDataRemove',
      responseId: 'respManualDataRemove',
      settingsKey: 'manualRemovals',
      refresh: (err: string, result: any) => this.handleGetManualRemovals(err, result),
    });
  }

  private async saveManualDateConfig(config: { inputId: string; responseId: string; settingsKey: 'manualAdditions' | 'manualRemovals'; refresh: (err: string, result: any) => void }) {
    const data = createManualAdditons();

    let textualInput: any = {};

    try {
      textualInput = JSON.parse(this.getInputValue(config.inputId) ?? '{}');
    } catch (err: any) {
      document.getElementById(config.responseId)!.innerHTML = err;
      return;
    }

    document.getElementById(config.responseId)!.innerHTML = '';
    for (let type in AllTrashTypes) {
      const trashType = AllTrashTypes[type];
      data[trashType] = await this.validateManualEntryDates(textualInput, trashType as TrashType);
    }

    this.homey.set(config.settingsKey, data, this.#onSettingsSet);

    // Trigger a full save so all app-level derived values are recalculated.
    await this.save();
    await this.saveLabelInput();

    this.homey.get(config.settingsKey, (err: string, result: any) => config.refresh(err, result));
  }

  async saveLabelInput() {
    var data: LabelSettings = {
      timeindicator: parseInt(this.getInputValue('labelTimeIndicator') || '0'),
      generic: this.getInputValue('labelGeneric') || this.homey.__('tokens.output.trashtypeycollectedonx'),
      NONE: {
        trashLong: this.getInputValue('labelNone') || this.homey.__('tokens.output.type.NONE'),
      },
    };

    for (let type in AllTrashTypes) {
      const trashType = AllTrashTypes[type] as TrashType;
      const ucFirstTrashType = this.#capitalizeFirstLetter(trashType);
      data[trashType] = {
        trashLong: this.getInputValue(`label${ucFirstTrashType}`) || this.homey.__(`tokens.output.type.${trashType}`),
        trashShort: this.getInputValue(`labelSmall${ucFirstTrashType}`) || this.homey.__(`widgets.trashType.${trashType}`),
        trashIcon: this.iconCache[trashType],
        trashColor: this.getInputValue(`widgetColor${ucFirstTrashType}`) || TrashColors[trashType],
      };
    }

    console.log(data);
    this.homey.set('labelSettings', data, this.#onSettingsSet);
  }

  async renderGlobalLabel() {
    var sentence = '<i>Global label: ' + this.getInputValue('labelGeneric') + '</i>';
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

  async renderWidgetLabel(trashType: string) {
    const text = this.getInputValue(`labelSmall${trashType}`) ?? this.homey.__(`widgets.trashtype.${trashType.toUpperCase()}`);
    const color = this.getInputValue(`widgetColor${trashType}`) ?? '#efefef';
    const icon = document.getElementById(`widgetIcon${trashType}`) as HTMLInputElement;

    document.getElementById(`trashDateTitle${trashType}`)!.innerHTML = text;
    document.getElementById(`trashDateColor${trashType}`)!.style.backgroundColor = color;

    if (icon === null || icon.files === null || icon.files.length <= 0) {
      return;
    }

    if (icon.files[0].size > 102400) {
      alert('Only files < 100kb are allowed.');
      return;
    }

    const fileType = icon.files[0].type;
    if (fileType !== 'image/png' && fileType !== 'image/svg+xml') {
      alert('Only .png and .svg files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event!.target!.result;
      if (typeof result === 'string') {
        const base64String = result.split(',')[1];
        (document.getElementById(`trashDateIcon${trashType}`) as HTMLImageElement).src = `data:${fileType};base64,${base64String}`;
        this.iconCache[trashType.toUpperCase() as TrashType] = `data:${fileType};base64,${base64String}`;
      }
    };

    reader.readAsDataURL(icon.files[0]);
  }

  async resetWidgetLabel(trashType: string) {
    await this.setWidgetLabel(trashType, '', '', '');
  }

  async setWidgetLabel(trashType: string, text: string, color: string, icon: string) {
    var ucFirstType = this.#capitalizeFirstLetter(trashType);

    this.iconCache[trashType as TrashType] = icon;

    this.setInputValue(`labelSmall${ucFirstType}`, text || this.homey.__(`widgets.trashType.${trashType}`));
    this.setPlaceholderValue(`labelSmall${ucFirstType}`, this.homey.__(`widgets.trashType.${trashType}`));
    this.setInputValue(`widgetColor${ucFirstType}`, color || TrashColors[trashType as TrashType]);
    this.setInputValue(`widggetIcon${ucFirstType}`, '');

    document.getElementById(`trashDateTitle${ucFirstType}`)!.innerHTML = text || this.homey.__(`widgets.trashType.${trashType}`);
    (document.getElementById(`trashDateIcon${ucFirstType}`) as HTMLImageElement)!.src = icon || `trashIcons/trash-${trashType}.svg`;
    document.getElementById(`trashDateColor${ucFirstType}`)!.style.backgroundColor = color || TrashColors[trashType as TrashType];
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

    // Extra days are only used for the every x weeks options, the main day can't be an extra day as well
    const extraDaysDiv = document.getElementById(`${prefix}_extradays_div`);
    if (extraDaysDiv) {
      extraDaysDiv.style.display = value >= 1 && value <= 8 ? 'block' : 'none';
      const dayOfWeek = this.getInputValue(`${prefix}_dayofweek`);
      extraDaysDiv.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.disabled = checkbox.value === dayOfWeek;
        if (checkbox.disabled) checkbox.checked = false;
      });
    }

    const periodsDiv = document.getElementById(`${prefix}_periods_div`);
    if (periodsDiv) {
      periodsDiv.style.display = value >= 1 && value <= 8 ? 'block' : 'none';
      const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
      const dayOfWeek = Number(this.getInputValue(`${prefix}_dayofweek`));
      document.getElementById(`${prefix}_season_day`)!.textContent = this.homey.__(`settings.dayofweek.${days[dayOfWeek]}`);
    }
  }

  renderPeriods(prefix: string) {
    const extraDaysDiv = document.getElementById(`${prefix}_extradays_div`);
    if (!extraDaysDiv) return;

    const periodsDiv = document.createElement('div');
    periodsDiv.id = `${prefix}_periods_div`;
    periodsDiv.style.display = 'none';

    // A different frequency for part of the year, using the same every x weeks options
    const seasonDiv = this.#createPeriodRow(`${prefix}_season`, 'settings.season');
    const seasonOption = document.createElement('select');
    seasonOption.className = 'homey-form-select';
    seasonOption.style.cssText = 'display: inline; margin-left: 5px;';
    seasonOption.id = `${prefix}_season_option`;
    document.querySelectorAll<HTMLOptionElement>(`#${prefix}_option option`).forEach((option) => {
      if (Number(option.value) >= 1 && Number(option.value) <= 8) {
        seasonOption.add(new Option(this.homey.__(option.dataset.i18n ?? ''), option.value));
      }
    });
    seasonDiv.appendChild(seasonOption);

    // The option names end in 'on', so follow them with the main day
    const seasonDay = document.createElement('p');
    seasonDay.style.cssText = 'display: inline; margin-left: 5px;';
    seasonDay.id = `${prefix}_season_day`;
    seasonDiv.appendChild(seasonDay);
    periodsDiv.appendChild(seasonDiv);

    // No collections at all for part of the year, e.g. garden waste in winter
    periodsDiv.appendChild(this.#createPeriodRow(`${prefix}_pause`, 'settings.pause'));

    extraDaysDiv.after(periodsDiv);
  }

  #createPeriodRow(id: string, label: string) {
    const row = document.createElement('div');

    const checkbox = document.createElement('label');
    checkbox.className = 'homey-form-checkbox';
    checkbox.style.cssText = 'display: inline-block; margin-left: 5px;';
    checkbox.innerHTML = `<input class="homey-form-checkbox-input" type="checkbox" id="${id}_enabled" />`;
    checkbox.innerHTML += '<span class="homey-form-checkbox-checkmark"></span><span class="homey-form-checkbox-text"></span>';
    checkbox.querySelector('.homey-form-checkbox-text')!.textContent = this.homey.__(label);
    row.appendChild(checkbox);

    row.appendChild(this.#createMonthDayPicker(`${id}_start`));
    const to = document.createElement('p');
    to.style.cssText = 'display: inline; margin-left: 5px;';
    to.textContent = this.homey.__('settings.periodto');
    row.appendChild(to);
    row.appendChild(this.#createMonthDayPicker(`${id}_end`));

    return row;
  }

  #createMonthDayPicker(id: string) {
    const picker = document.createElement('span');

    const day = document.createElement('select');
    day.className = 'homey-form-select';
    day.style.cssText = 'display: inline; width: auto; margin-left: 5px;';
    day.id = `${id}_day`;
    for (let i = 1; i <= 31; i++) {
      day.add(new Option(`${i}`, String(i).padStart(2, '0')));
    }

    const month = document.createElement('select');
    month.className = 'homey-form-select';
    month.style.cssText = 'display: inline; width: auto; margin-left: 5px;';
    month.id = `${id}_month`;
    this.homey
      .__('settings.months')
      .split(',')
      .forEach((name, i) => month.add(new Option(name, String(i + 1).padStart(2, '0'))));

    picker.appendChild(day);
    picker.appendChild(month);
    return picker;
  }

  setPeriods(prefix: string, values: ManualSetting | undefined) {
    for (const period of ['season', 'pause']) {
      const start = period === 'season' ? values?.season_start : values?.pause_start;
      const end = period === 'season' ? values?.season_end : values?.pause_end;
      const checkbox = document.getElementById(`${prefix}_${period}_enabled`) as HTMLInputElement;
      if (!checkbox) continue;

      checkbox.checked = !!(start && end);
      if (start && end) {
        this.setInputValue(`${prefix}_${period}_start_month`, start.substring(0, 2));
        this.setInputValue(`${prefix}_${period}_start_day`, start.substring(3, 5));
        this.setInputValue(`${prefix}_${period}_end_month`, end.substring(0, 2));
        this.setInputValue(`${prefix}_${period}_end_day`, end.substring(3, 5));
      }
    }

    if (values?.season_option) {
      this.setInputValue(`${prefix}_season_option`, values.season_option);
    }
  }

  getPeriods(prefix: string) {
    const periods: { [key: string]: string | number } = {};
    const monthDay = (id: string) => `${this.getInputValue(`${id}_month`)}-${this.getInputValue(`${id}_day`)}`;

    if ((document.getElementById(`${prefix}_season_enabled`) as HTMLInputElement)?.checked) {
      periods.season_option = Number(this.getInputValue(`${prefix}_season_option`));
      periods.season_start = monthDay(`${prefix}_season_start`);
      periods.season_end = monthDay(`${prefix}_season_end`);
    }

    if ((document.getElementById(`${prefix}_pause_enabled`) as HTMLInputElement)?.checked) {
      periods.pause_start = monthDay(`${prefix}_pause_start`);
      periods.pause_end = monthDay(`${prefix}_pause_end`);
    }

    return periods;
  }

  renderExtraDays(prefix: string) {
    const dayDiv = document.getElementById(`${prefix}_day_div`);
    if (!dayDiv) return;

    const extraDaysDiv = document.createElement('div');
    extraDaysDiv.id = `${prefix}_extradays_div`;
    extraDaysDiv.style.display = 'none';

    const label = document.createElement('p');
    label.style.cssText = 'display: inline; margin-left: 5px;';
    label.textContent = this.homey.__('settings.extradays');
    extraDaysDiv.appendChild(label);

    // Same order as the day of week select, Monday first
    const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
    for (const day of [1, 2, 3, 4, 5, 6, 0]) {
      const checkbox = document.createElement('label');
      checkbox.className = 'homey-form-checkbox';
      checkbox.style.cssText = 'display: inline-block; margin-left: 5px;';
      checkbox.innerHTML = `<input class="homey-form-checkbox-input" type="checkbox" id="${prefix}_extraday_${day}" value="${day}" />`;
      checkbox.innerHTML += '<span class="homey-form-checkbox-checkmark"></span><span class="homey-form-checkbox-text"></span>';
      checkbox.querySelector('.homey-form-checkbox-text')!.textContent = this.homey.__(`settings.dayofweek.${days[day]}`);
      extraDaysDiv.appendChild(checkbox);
    }

    dayDiv.after(extraDaysDiv);
  }

  setExtraDays(prefix: string, extraDays: number[]) {
    for (let day = 0; day <= 6; day++) {
      const checkbox = document.getElementById(`${prefix}_extraday_${day}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = extraDays.map(Number).includes(day);
      }
    }
  }

  getExtraDays(prefix: string) {
    const extraDays: number[] = [];
    for (let day = 0; day <= 6; day++) {
      const checkbox = document.getElementById(`${prefix}_extraday_${day}`) as HTMLInputElement;
      if (checkbox?.checked) {
        extraDays.push(day);
      }
    }

    return extraDays;
  }

  // Fields shown when the selected provider doesn't define its own list (or no provider is selected).
  #getDefaultFieldsForCountry(country: string): ApiField[] {
    switch (country) {
      case 'BE':
        return ['postcode', 'number', 'streetname'];
      case 'NO':
        return ['postcode', 'number', 'streetname', 'countyId', 'apiKey'];
      case 'DK':
        return ['postcode', 'number', 'streetname'];
      default:
        return ['postcode', 'number'];
    }
  }

  async toggleFieldsBasedOnCountry() {
    const countrySelected = this.getInputValue('country') ?? 'NL';

    this.fillApis(countrySelected || undefined);
    this.applyFields(this.#getDefaultFieldsForCountry(countrySelected), undefined);
  }

  async toggleFieldsBasedOnSelectedProvider() {
    const provider = this.apiRegistry.find((entry) => entry.id === this.getInputValue('api'));
    const country = provider?.country ?? this.getInputValue('country') ?? 'NL';

    if (provider) {
      this.setInputValue('country', provider.country);
    }

    this.applyFields(provider?.fields ?? this.#getDefaultFieldsForCountry(country), provider);
  }

  applyFields(visible: ApiField[], provider: ApiMeta | undefined) {
    const groups: { [key in ApiField]: { div: string; input: string; label: string } } = {
      postcode: { div: 'postalcode_div', input: 'postcode', label: 'settings.postcode' },
      number: { div: 'number_div', input: 'number', label: 'settings.hnumber' },
      streetname: { div: 'streetname_div', input: 'streetname', label: 'settings.streetname' },
      cityname: { div: 'cityname_div', input: 'cityname', label: 'settings.cityname' },
      externalId: { div: 'externalId_div', input: 'externalId', label: 'settings.externalId' },
      countyId: { div: 'countyId_div', input: 'countyId', label: 'settings.countyId' },
      apiKey: { div: 'apiKey_div', input: 'apiKey', label: 'settings.apiKey' },
    };

    for (const field of Object.keys(groups) as ApiField[]) {
      const group = groups[field];
      const isVisible = visible.includes(field);

      document.getElementById(group.div)!.style.display = isVisible ? 'block' : 'none';
      const customLabel = provider?.fieldLabels?.[field];
      document.querySelector(`#${group.div} label`)!.textContent = (customLabel && this.homey.__(customLabel)) || this.homey.__(group.label);

      // Don't keep values for fields the selected provider doesn't use.
      if (!isVisible) {
        this.setInputValue(group.input, '');
      }
    }

    const instructions = document.getElementById('providerInstructions')!;
    const instructionText = provider?.instructions ? this.homey.__(provider.instructions) : '';
    instructions.textContent = instructionText;
    instructions.style.display = instructionText ? 'block' : 'none';
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

  makeSearchableSelect(sel: HTMLSelectElement) {
    const dl = document.getElementById('dl-api-list') as HTMLDataListElement;
    const inp = document.getElementById('dl-api-input') as HTMLInputElement;
    inp.value = sel.selectedOptions[0]?.text || '';

    inp.addEventListener('change', () => {
      const match = Array.from(dl.options).find((x) => x.value === inp.value);
      if (match) {
        sel.value = match.dataset.value || '';
        this.toggleFieldsBasedOnSelectedProvider();
      }
    });

    inp.addEventListener('input', () => {
      if (!inp.value) sel.selectedIndex = -1;
    });

    inp.addEventListener('blur', () => {
      if (!Array.from(dl.options).some((x) => x.value === inp.value)) {
        inp.value = '';
        sel.selectedIndex = -1;
      }
    });
  }

  fillApis(country?: string) {
    const apiSel = document.getElementById('api') as HTMLSelectElement;
    const dl = document.getElementById('dl-api-list') as HTMLDataListElement;

    apiSel.replaceChildren();
    apiSel.add(new Option(this.homey.__('settings.unknown'), ''));
    apiSel.add(new Option(this.homey.__('settings.notapplicable'), 'not-applicable'));

    this.apiRegistry.filter((x) => !country || x.country === country).forEach(({ id, name }) => apiSel.add(new Option(name, id)));

    // Convert to array for iteration
    dl.replaceChildren();
    Array.from(apiSel.options).forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.text;
      opt.dataset.value = o.value;
      dl.appendChild(opt);
    });
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
