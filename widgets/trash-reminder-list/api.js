'use strict';

module.exports = {
  async getSettings({ homey }) {
    const _settingsKey = `collectingDays`;
    return homey.settings.get(_settingsKey);
  },
};
