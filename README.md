# Trashcan Reminder 2.0
Homey will remind you to put the trash out! You can do this by providing a postal code, house number and country (NL/BE).

## Supported Cities
Unfortunately not all cities work with the Trashcan Reminder, if you can find your house with one of the links below your house is supported:

- [Mijn Afval Wijzer](http://www.mijnafvalwijzer.nl) Please note that only when the text becomes green your city is supported!
- [De Afval App](http://www.deafvalapp.nl/calendar/kalender_start.jsp)
- [Cyclus](http://afvalkalender.cyclusnv.nl/)
- [Afvalwijzer Arnhen](https://www.afvalwijzer-arnhem.nl)
- [Gemeente Hellendoorn](http://hellendoornafvalkalender.2go-mobile.com)
- [Twentemilieu](https://www.twentemilieu.nl)
- [Recyle Manager](http://www.recyclemanager.nl)
- [RMN](https://inzamelschema.rmn.nl/)
- [Afvalkalender Meerlanden](https://afvalkalender.meerlanden.nl/form)
- [Afvalkalender Venray](https://afvalkalender.venray.nl/form)
- [Inzamelkalender HVC](https://inzamelkalender.hvcgroep.nl/)

If your city is not supported you can always add your schedule manually. You can add new cities yourself, but requests to add new cities aren't honoured. If you wish to contribute to the project (for example by adding support for a city). I would advise you to take a look at [this explanation](https://github.com/robertraaijmakers/com.trashchecker/tree/master/developers).

## Supported Cards
There is one card that you can place in the "then" column. The card let's you check if trash type X is collected << today, tomorrow, day after tomorrow >>.

## Supported Speech (currently broken due to upgrade to SDK v2)
Please upvote [this issue](https://github.com/athombv/homey/issues/1779), or provide some information on an app that has upgraded to SDK v2 and uses speech.

You can ask Homey four type of questions regarding your waste collection:
- When is the green container collected?
- What is collected next monday?
- Is the residual waste collected this friday?
- Which type of trash is collected next?

## Tags (currently in beta, nightly refresh makes the app crash sometimes)
There is one global tag available that you can set dynamically via the settings. This tag will show the value belonging to the trash type that is collected on this day (or tomorrow/day after tomorrow, depending on your settings).
