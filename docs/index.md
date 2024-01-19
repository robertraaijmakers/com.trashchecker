# Trashcan Reminder 2.0
Homey will remind you to put the trash out! You can do this by providing a postal code, house number and country (NL/BE).

*NOTE* NO this app will NOT work on Homey Cloud. I'm not investing [100 euro's](https://homey.app/nl-nl/store/product/homey_developer_athom_12m/) a year and my free time on this.

Here you can find information regarding:
- [Settings](settings.md)
- [Flow Examples](flow-examples.md)
- [Developer Guidelines](developer-guidelines.md)

## Supported Cities
A lot of cities are supported with this trashcan reminder. If your city is not supported you can always add your schedule manually. You can add new cities yourself, but requests to add new cities aren't honoured. If you wish to contribute to the project (for example by adding support for a city). I would advise you to take a look at [this explanation](developer-guidelines.md).

### Netherlands
- [Afval App](http://www.deafvalapp.nl/calendar/kalender_start.jsp)
- [Afvalkalender ACV](https://www.acv-groep.nl/)
- [Afvalkalender Almere](https://almere.ximmio.com/modules/53d8db94-7945-42fd-9742-9bbc71dbe4c1/kalender/)
- [Afvalkalender Circulus-Berkel](https://mijn.circulus.nl/)
- [Afvalkalender Cyclus](https://afvalkalender.cyclusnv.nl/)
- [Afvalkalender Dar](https://afvalkalender.dar.nl)
- [Afvalkalender Meerlanden](https://afvalkalender.meerlanden.nl)
- [Afvalkalender Peel en Maas](https://afvalkalender.peelenmaas.nl)
- [Afvalkalender Purmerend](https://afvalkalender.purmerend.nl/)
- [Afvalkalender RD4](https://rd4.syzygy.eu)
- [Afvalkalender Reinis](https://reinis.ximmio.com/modules/9dc25c8a-175a-4a41-b7a1-83f237a80b77/sitekalender/)
- [Afvalkalender RMN](https://inzamelschema.rmn.nl)
- [Afvalkalender ROVA](https://www.rova.nl)
- [Afvalkalender Venray](https://afvalkalender.venray.nl)
- [Afvalkalender ZRD](https://afvalkalender.zrd.nl)
- [Afvalwijzer Pre Zero](https://inzamelwijzer.prezero.nl/)
- [Area Reiniging](https://www.area-afval.nl/voor-bewoners/afvalkalender/digitale-afvalkalender)
- [Avalex](https://www.avalex.nl/)
- [Avri](https://www.avri.nl/inwoners/afval/afvalkalender/)
- [Den Bosch Afvalstoffendienstkalender](http://denbosch.afvalstoffendienstkalender.nl)
- [GAD Gooi en Vechtstreek](https://inzamelkalender.gad.nl/)
- [Gemeente Assen](https://21burgerportaal.mendixcloud.com/p/assen/landing/)
- [Gemeente Hellendoorn](https://www.hellendoorn.nl/wonen-leven/publicatie/afval)
- [Huisvuilkalender Den Haag](https://huisvuilkalender.denhaag.nl/)
- [Inzamelkalender HVC](https://inzamelkalender.hvcgroep.nl)
- [Mijn Afvalwijzer](http://www.mijnafvalwijzer.nl)
- [Mijn Blink](https://mijnblink.nl/)
- [Recyle Manager](http://www.recyclemanager.nl)
- [Reinigingsdienst Waardlanden](https://www.waardlanden.nl/particulieren/afvalinzameling/afvalkalender)
- [Twentemilieu](https://www.twentemilieu.nl)

### Belgium
- [Recycle!](https://recycleapp.be/home)

## Supported Cards
There is one card that you can place in the "and" column. The card lets you check whether or not trash is collected either today, tomorrow or the day after tomorrow. The type of trash that is checked for can be set to a specific one, or to 'any' to include all types.

## Supported Speech / Chat
The speech is removed in this new version. Homey is removing the speech completely from their own product.

## Tags
There are three global tags available. The tags can be configured trough the settings page. The tags represent the trash that is collected today, tomorrow and the day after tomorrow.
If you want to create a flow that notifies you what type of trash is collected today, use the "today" tag.
If you want to create a flow that notifies you what type of trash is collected tomorrow, use the "tomorrow" tag.
If you want to create a flow that notifies you what type of trash is collected the day after tomorrow, use the "day after tomorrow" tag.
Plase note that the tags are independent from the "What type of trash is collected on << day >>" card available in the "and" column.