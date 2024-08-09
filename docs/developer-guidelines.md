# Developers
Because trash collection is organized by the local city authorities there is no national database with all the collection dates. However, many cities provide the dates on which trash will be collected openly. Because it would take a lot of time to write a handler for ech of the 390 municipalities in the Netherlands and the 589(!) in Belgium we made it easy for developers to add a handler for their city. You can submit your handler through a pull-request [here](https://github.com/robertraaijmakers/com.athom.trashchecker). I will explain how this works:

In the file [trashapis.js](https://github.com/robertraaijmakers/com.trashchecker/blob/beta/trashapis.js) there are functions for each trash data provider the function takes a postcode, a house number, a street (for Belgium) and a country.

```
function yourTrashCollectionProviderName(postcode, housenumber, street, country) {

	/** Your custom trash collection implementation **/
}

```

First you should check if the provided data is valid. If this isn't the case, return a promise with an error ( or anything 'truthy' ). In the case that the data is valid you should proceed with retrieving the trash dates and return a promise with the valid dates. The dates should be in the following format:
<pre><code>
let dates = {
	REST: ['2016-12-29',
			'2016-12-01',
			'2016-11-03',
			'2016-06-10',
		    '2016-09-08',
			'2016-08-11'],
	GFT: [ '2016-07-14',
			'2016-06-16',
		    '2016-05-19',
		    '2016-04-21',
		    '2016-03-24',
		    '2016-02-25',
			'2016-01-28'] }
</code></pre>

Currently the supported trash types are (these are also the required property names):
- REST
- GFT
- PAPIER
- PLASTIC
- PMD
- TEXTIEL
- GROF
- KERSTBOOM

In the Netherlands there are a couple of vendors that provide "default" software functionality to municipalities and/or regions. If your provider uses one of these default software packages then the implementation is even more easy.

The following providers are supported:
- RecycleApp
- Waste API
- Mijn Afvalwijzer (old)
- Mijn Afvalwijzer (new)

The implementation for the Waste API is as follows. You need two parameters that differ per implementation. You need the Company ID and the API URL.
```
function twenteMilieu(postcode, housenumber, street, country) {
    console.log("Checking Twente Milieu");
    generalImplementationWasteApi(postcode, housenumber, country, "<< enter the company ID, this is a GUID >>", "<< enter the API URL e.g. organizationname.ximmio.com >>");
}
```

The implementation for the Recycle App is as follows. For this you don't need any parameters.
```
function recycleApp(postcode, housenumber, street, country)
    generalImplementationRecycleApp(postcode, housenumber, street, country);
}
```

The implementation for Mijn Afvalwijzer (old) is as follows. You need to get the API URL and enter it as a parameter.
```
function rovaAfvalkalender(postcode, housenumber, street, country) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "<< enter the API URL e.g. https://inzamelkalender.rova.nl/nl/>>");
}
```

The implementation for Mijn Afvalwijzer (new) is as follows. You need to get the API URL and enter it as a parameter.
```
function afvalkalenderCyclus(postcode, housenumber, street, country) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, '<< enter the API URL e.g. afvalkalender.cyclusnv.nl>>');
}
```