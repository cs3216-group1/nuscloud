---
title: 'Getting Started - Javascript'

layout: nil
---

The Javascript SDK is the recommended way to integrate your app with NUSCloud.

### Setup

You can register a new app [here](http://nuscloud.com/client/registration). Ensure that a correct domain is provided and take note of your app Id.

Include the following HTML code in your webpage to load the SDK.
 

```
<script src="http://nuscloud.com/sdk/sdk.js"></script>
<script>
var host = "http://nuscloud.com";
var redirect_url = "some-page-on-your-site";
var app_id = "your-app-id";
var permissions = "info-read";
var nuscloud = new NUSCloud(host, redirect_url, app_id, permissions);
</script>
```

###Details

Each element mentioned above is explained below:

####Host

The URL hosting NUSCloud

####Redirect URL

When the user logs in, he/she is redirected momentarily (in a popup window) to a page of your website momentarily for your site to receive the relevant NUSCloud access token.

All that is required is to provide a URL of the same domain your app is running in (to receive the access token correctly) and the same domain provided to NUSCloud on registering your app (for security issues). Once the redirect is completed, the sdk will automatically store the access token and close the popup, so the content on the URL is immaterial.

However, it is recommended that the page be as lightweight as possible (or blank) to minimize loading times and thus delays in the login flow.

####App Id

This is a unique identifier for your app provided on registration.

####Permissions

This is a space separated string of the permissions you want to request the user for. As of now, the user can either accept or reject all permissions.

Permissions that can be requested are:

- **''info-read''** - to read users basic information (name, username, email)
- **''friends-read''** - to access friends of the user using the app and allow the user to be accessed by friends using the app
- **''(app-namespace)-read''** - this is if your app requires permission to read from other NUSCloud apps, where (app-namespace) refers to the namespace of the app you want to read data from (this is why NUSCloud is collaborative!)
- **''ivle-read''** - to read users IVLE information
- **''ivle-write''** - to write to IVLE data (send POST requests to IVLE)

###Requests

Other than [authentication](/#/authentication), all requests through the sdk are made in the following formats:

```nuscloud.get(path, callback)```

```nuscloud.post(path, data, callback)```

```nuscloud.delete(path, callback)```

The arguments expected above are:

- **path** is a URL path String
- **data** is an object
- **callback** is a function that takes in one response argument

###Responses

The response format will be the JSON string representation of the object types specified.

Each response will have a *status* attribute, and other attributes specific to each method.


###Quickstart

The first step is to login the user. Call the following Javascript from a login button of your design and choice:

```nuscloud.login(callback)```

Learn more about authentication [here](/#/authentication)

Once the user is successfully logged in, you can make requests to NUSCloud.

By default, your app is able to store, modify and retrieve data for the logged in user.

To store data for the user in your current app use:

```nuscloud.post('me/app/', data, callback)```

This is a special form of the api call discussed [here](/#/edit-user-app-data)

To get data for the user in your current app:

```nuscloud.get('me/app', callback)```

This is a special form of the api call discussed [here](/#/get-user-app-data)

Yup! It is that easy to setup authentication and storage!

To work with friends, see [here](/#/get-friends)

To work with IVLE, see [here](/#/ivle)
