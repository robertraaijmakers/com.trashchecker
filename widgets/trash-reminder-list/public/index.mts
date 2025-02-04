'use strict';

import type HomeyWidget from 'homey/lib/HomeyWidget.js';
import { WidgetItem, WidgetSettings } from '../../../types/localTypes.js';
import { LabelSettings, TrashType } from '../../../assets/publicTypes.js';

class WidgetScript {
  private homey: HomeyWidget;
  private settings: WidgetSettings;

  constructor(homey: HomeyWidget) {
    this.homey = homey;
    this.settings = this.convertSettings(homey.getSettings());
  }

  private convertSettings(settings: Record<string, unknown>): WidgetSettings {
    return {
      displayYesterday: settings['display-yesterday'] as boolean,
      layoutType: settings['layout-type'] as 'compact' | 'large',
      maxItems: settings['max-items'] as number,
      singleTypes: settings['single-types'] as boolean,
      listHeight: settings['list-height'] as number,
      displayRule: settings['display-provider-icons'] as 'settings' | 'settings-icons' | 'settings-iconscolors' | 'trashprovider',
    };
  }

  public async onHomeyReady(): Promise<void> {
    this.Init();
    this.homey.on('settings_changed', (settingsUpdated: any) => this.Init());
  }

  public async Init() {
    try {
      const collectionInfo = (await this.homey.api('GET', `/collectiondata?displayYesterday=${this.settings.displayYesterday}`)) as WidgetItem[];

      const tbody = document.querySelector('#trashCollections');
      if (tbody === null) return;

      tbody.innerHTML = '';
      let counter = 0;
      let rowHeight = 95;
      let usedTypes: Record<TrashType, string> = {} as Record<TrashType, string>;
      let itemsPerRow = 4;

      for (let index in collectionInfo) {
        const trashItem = collectionInfo[index];
        const monthStyle = this.settings.layoutType === 'compact' ? 'long' : 'short';
        const displayDate = await this.getFormattedDate(trashItem.activityDate, monthStyle);

        if (counter >= this.settings.maxItems) continue;
        if (this.settings.singleTypes === true && typeof usedTypes[trashItem.type] !== 'undefined') continue;

        usedTypes[trashItem.type] = 'used';
        counter += 1;

        // Select right display thing based on widget setting
        const trashIcon = this.settings.displayRule != 'settings' ? trashItem.icon || trashItem.settingIcon : trashItem.settingIcon;
        const trashTypeText = this.settings.displayRule === 'trashprovider' ? trashItem.localText || trashItem.settingText : trashItem.settingText;
        const trashColor =
          this.settings.displayRule === 'settings-iconscolors' || this.settings.displayRule === 'trashprovider'
            ? `style="background-color: ${trashItem.color || trashItem.settingColor}"`
            : `style="background-color: ${trashItem.settingColor}"`;

        if (this.settings.layoutType === 'large') {
          tbody.innerHTML += `
          <div class="trash-item-container">
            <span class="dot-large dot-type-${trashItem.type}" ${trashColor}><img src="${trashIcon}" /></span>
            <p class="trash-date-title trash-date">${displayDate}</p>
            ${trashItem.isCleaned ? '<span class="cleaning-icon">🫧</span>' : ''}
          </div>`;
        } else {
          rowHeight = 57;
          itemsPerRow = 2;

          tbody.innerHTML += `
          <div class="trash-item-container-compact">
            <span class="dot-compact dot-type-${trashItem.type}" ${trashColor}><img src="${trashIcon}" /></span>
            <div class="trash-date-container">
              <p class="trash-date-title">${trashTypeText}</p>
              <p class="homey-text-small-light trash-date-subtitle">${displayDate}</p>
            </div>
            ${trashItem.isCleaned ? '<span class="cleaning-icon">🫧</span>' : ''}
          </div>`;
        }
      }

      if (this.settings.layoutType === 'large' && counter % 3 === 0) itemsPerRow = 3;

      if (this.settings.layoutType === 'large' && itemsPerRow === 4) {
        tbody.classList.remove('triple');
        tbody.classList.add('quad');
      } else if (this.settings.layoutType === 'large') {
        tbody.classList.remove('quad');
        tbody.classList.add('triple');
      }

      const dBody = document.querySelector('#main-body');
      if (dBody === null) return;

      const items = dBody.querySelectorAll('.trash-item-container, .trash-item-container-compact');
      dBody.classList.remove('my-custom-body-overflow-hidden');

      const totalItems = this.settings.listHeight * itemsPerRow;
      if (totalItems >= items.length) {
        dBody.classList.add('my-custom-body-overflow-hidden'); // Make the widget not overflow
      }

      this.homey.ready({ height: this.settings.listHeight * rowHeight + (this.settings.listHeight - 1 * 10) });
    } catch (error) {
      this.homey.ready({ height: 200 });

      const tbody = document.querySelector('#trashCollections');
      if (tbody === null) return;
      tbody.innerHTML = `Error: ${error}`;
    }
  }

  private async getFormattedDate(firstDate: Date, monthStyle: 'short' | 'long' | 'narrow' | undefined) {
    const currentDate = new Date();
    firstDate = new Date(firstDate);

    // Get today's date at midnight for accurate comparison
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Create yesterday's and tomorrow's dates
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Compare firstDate with today, yesterday, and tomorrow
    if (firstDate.toDateString() === yesterday.toDateString()) {
      return this.homey.__('tokens.output.timeindicator.t-1');
    } else if (firstDate.toDateString() === today.toDateString()) {
      return this.homey.__('tokens.output.timeindicator.t0');
    } else if (firstDate.toDateString() === tomorrow.toDateString()) {
      return this.homey.__('tokens.output.timeindicator.t1');
    } else {
      // Options to format the date as day and short month name
      const options = { weekday: 'short', day: 'numeric', month: monthStyle } as Intl.DateTimeFormatOptions;

      // Format the date to "12 Oct"
      return firstDate.toLocaleDateString(undefined, options);
    }
  }
}

window.onHomeyReady = async (homey: any): Promise<void> => await new WidgetScript(homey).onHomeyReady();
