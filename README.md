# Trashcan Reminder 2.0
Homey will remind you to put the trash out! You can do this by providing a postal code, house number and country (NL/BE).

## Supported Cities
A lot of cities are supported with this trashcan reminder. If your city is not supported you can always add your schedule manually. You can add new cities yourself, but requests to add new cities aren't honoured. If you wish to contribute to the project (for example by adding support for a city). I would advise you to take a look at [this explanation](https://github.com/robertraaijmakers/com.trashchecker/tree/master/developers).

- [Afvalwijzer Suez](https://inzamelwijzer.suez.nl/)
- [Afvalkalender ACV](https://www.acv-groep.nl/)
- [Afvalkalender Circulus-Berkel](https://mijn.circulus-berkel.nl)
- [Afvalkalender Meerlanden](https://afvalkalender.meerlanden.nl)
- [Afvalkalender Peel en Maas](https://afvalkalender.peelenmaas.nl)
- [Afvalkalender Venray](https://afvalkalender.venray.nl)
- [Afvalkalender ZRD](https://afvalkalender.zrd.nl)
- [Avalex](https://www.avalex.nl/)
- [Cure](https://afvalkalender.cure-afvalbeheer.nl)
- [Cyclus](http://afvalkalender.cyclusnv.nl)
- [Dar Afvalkalender](https://afvalkalender.dar.nl)
- [De Afval App](http://www.deafvalapp.nl/calendar/kalender_start.jsp)
- [Den Bosch](http://denbosch.afvalstoffendienstkalender.nl)
- [GAD Gooi en Vechtstreek](https://inzamelkalender.gad.nl/)
- [Gemeente Hellendoorn](https://www.hellendoorn.nl/wonen-leven/publicatie/afval)
- [Inzamelkalender HVC](https://inzamelkalender.hvcgroep.nl)
- [Mijn Afvalwijzer](http://www.mijnafvalwijzer.nl)
- [Mijn Blink](https://mijnblink.nl/)
- [RD4](https://rd4.syzygy.eu)
- [Recyle Manager](http://www.recyclemanager.nl)
- [RMN](https://inzamelschema.rmn.nl)
- [Rova](https://www.rova.nl)
- [Twentemilieu](https://www.twentemilieu.nl)

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