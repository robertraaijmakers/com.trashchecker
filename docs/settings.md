# How to configure Trashcan Reminder 2.0
Trashcan Reminder 2.0 has several configuration settings which can be found under "Settings" in your Homey app. On this page you can configure your postal code and house number to see if your address is supported by one of the API's. You can also enter data based on "frequency" or even fully manual. Next to that you can configure the text, color and icons of the widget and also configure a custom text to output in the global tags. This wide range of configuration gives you the flexibility to use the app to your liking.

## Working with API
When you first set-up your app you can enter your postal code and house number here in the fields. Then select "Save changes" and the app will search all known API's to find if one gives a valid response. When this is found, you wel get a green text and the dropdown box will show you which API has been chosen. In the debug information at the bottom of the screen (when you scroll down) you can find which dates are found (after pressing "refresh debug information").

If you don't want to get notifications for a certain trash type (for instance, when your trash provider does collect this type of trash, but you don't have that certain container yourself). Then you can easily disable that type by setting the "N/A" (not applicable) for that trash type under the "Date Settings". This way the information of that trash type will be ignored in the flow and in your widget.

## Working with schedule/manual input
When there is no API found based on your postal code and house number you can either try to search for the API and add it in the code yourself. Or you can figure out the schedule behind your trash pickups. Most of the time there is some kind of logic in the collection of the trash.

For each type of trash you can configure a seperate schedule. This can be done by selecting the dropdown below the type of trash you want to configure. There are a lot of schedule options, so I'm not going to explain them all here. But basically it comes down to this:
* Per x-weeks (every week, every other week, once every 3, 4 or 8 weeks)
* Every first/second/third/fourth/second last/last day of period (week, month, year)

By selecting one of the options, new fields that must be filled in will be shown. This is to determine the start of the period and make a correct calculation. You can test your schedule by saving the results and scrolling down to the Debug Information (click: "refresh debug information").

## Configure Global Tag Settings
There are three global tags available within the flows. The tags are:
* Collected Today
* Collected Tomorrow
* Collected The Day After Tomorrow

To configure this text you can enter your custom "Global Tag Sentence". In this field you can configure, based om some variables, the text displayed in the global tags. The variables you can use are:
* __type__          ; this variable will be replaced with the type(s) of trash that is/are collected.
* __time__          ; this variable will be replaced with "today", "tomorrow" or "the day after tomorrow" based on which tag the sentence is sent to.
* __plural__        ; this variable will be replaced with either "is" or "are" depending if one or more types are collected.

You can try out the variables and the sentences that are generated in the settings area. Below every type the sentence is shown for that type based on your input. Below the "Global Tag Sentence" one example is displayed on how multiple types will be rendered.

When you change the dropdown field after "Type Collected" to: today/tomorrow/day after tomorrow, the text will be changed as well.

This way you are in full control of the text that is displayed in the global tags. This is especially usefull for plastics/PMD collection as this is very region/city specific and isn't always mentioned and categorized in the correct way.

You can see some [optimal flow examples here](flow-examples.md).

## Configure Widget Settings
These settings allow you to configure the individual look and feel per trash type. You can influence the color, icon and text that is displayed in the widget. If you made changes and you don't like them, you can use the &#x21BA; button to reset the details back to the default for that specific trash type.

## Advanced Data Entry
Here you can enter custom dates for trashcan pick-up in JSON format. These dates will be *added* to the existing dates that already exist based on other selected options. This is only for advanced users and isn't recommended to use.

```
{
    GFT: ['2022-05-05T00:00:00Z','2022-05-19T00:00:00Z'],
    REST: [],
    PAPIER: [],
    GROF: [],
    PLASTIC: [],
    PMD: [],
    TEXTIEL: [],
    KERSTBOOM: []
}
```

## Debug information
This shows the dates found based on the input given. When you have applied new settings, please click "refresh debug information" to get the latest and greatest information.