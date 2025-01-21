# Developers
Because trash collection is organized by the local city authorities there is no national database with all the collection dates. However, many cities provide the dates on which trash will be collected openly. Because it would take a lot of time to write a handler for ech of the 390 municipalities in the Netherlands and the 589 in Belgium we made it easy for developers to add a handler for their city. You can submit your handler through a pull-request [here](https://github.com/robertraaijmakers/com.trashchecker/). Let me show you how it works.

In the file [trashapis.ts](https://github.com/robertraaijmakers/com.trashchecker/blob/beta/lib/trashapis.ts) there are functions for each trash data provider the function takes an ApiSettings object and contains the number, zipcode, street and country.

```
async #yourTrashCollectionProviderName(apiSettings: ApiSettings) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

	/** Your custom trash collection implementation **/
}

```

First you should check if the provided data is valid. If this isn't the case, throw an error. In the case that the data is valid you should proceed with retrieving the trash dates and return an object of type ActivityDates[].

Currently the supported trash types are (these are also the required property names):
- REST
- GFT
- PAPIER
- PLASTIC
- PMD
- TEXTIEL
- GROF
- KERSTBOOM

In the Netherlands and Belgium there are a couple of vendors that provide "default" software functionality to municipalities and/or regions. If your provider uses one of these default software packages then the implementation is even more easy.

The following providers are supported:
- Waste API
- RecycleApp
- Mijn Afvalwijzer
- Klikomanager

The implementation for the Waste API is as follows. You need two parameters that differ per implementation. You need the Company ID and the API URL.
```
async #afvalkalenderMeerlanden(apiSettings: ApiSettings) {
  return this.#generalImplementationWasteApi(apiSettings, '<< enter the company ID, this is a GUID >>', '<< enter the API URL e.g. organizationname.ximmio.com >>');
}
```

The implementation for the Recycle App is as follows. For this you don't need any parameters.
```
async #recycleApp(apiSettings: ApiSettings) {
  return this.#generalImplementationRecycleApp(apiSettings);
}
```

The implementation for Mijn Afvalwijzer is as follows. You need to get the API URL and enter it as a parameter.
```
async #darAfvalkalender(apiSettings: ApiSettings) {
  return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, '<< enter the API URL e.g. afvalkalender.dar.nl>>');
}
```

The implementation for Klikomanager is as follows. You need to get the API URL and a company code and enter it as a parameters.
```
async #klikoManagerOudeIJsselstreek(apiSettings: ApiSettings) {
  return this.#generalImplementationContainerManager(apiSettings, '<< enter the API URL e.g. cp-oudeijsselstreek.klikocontainermanager.com', '454');
}
```
