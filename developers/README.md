# Developers
Because trash collection is organized by the local city authorities there is no national database with all the
collection dates. However, many cities provide the dates on which trash will be collected openly. Because it would take a lot of time to write a handler for ech of the 390 municipalities in the Netherlands and the 589(!) in Belgium I have decided to make it easy for developers to add a handler for their city. You can submit your handler through a pull-request [here](https://github.com/apstemmer/com.athom.trashchecker). I will explain how this works:

In the file [trashapis.js](https://github.com/apstemmer/com.athom.trashchecker/blob/full/trashapis.js) there are functions for each trash data provider the function takes a postcode, a house number, a country and a callback.

```
function(postcode, homenumber, country, callback){

	if(!isDataValid(postcode, homenumber, country)){
		return callback(new Error('unsupported city'));
	}

	request('http://www.mytrashapi.com/path/to/api',function(err, res, body){
		let dates = {}
		/*
		parse response, put in object(dates in this example) using required format
        .
        .
        .
    and give it back using the callback
		*/
		return callback(null, dates)
	});

}

```

First you should check if the provided data is valid. If this isn't the case, call the callback with an error ( or anything 'truthy' ). In the case that the data is valid you should proceed with retrieving the trash dates and pass the dates through to the callback. The data should be in the following format:
<pre><code>
let dates = {
	REST: ['29-12-2016',
				 '01-12-2016',
				 '03-11-2016',
				 '06-10-2016',
		     '08-09-2016',
				 '11-08-2016'],
	GFT: [ '14-07-2016',
				 '16-06-2016',
		     '19-05-2016',
		     '21-04-2016',
		     '24-03-2016',
		     '25-02-2016',
				 '28-01-2016'] }
</code></pre>

Currently the supported trash types are (these are also the required property names):

- REST
- GFT
- PAPIER
- PLASTIC
- PMD
- TEXTIEL
