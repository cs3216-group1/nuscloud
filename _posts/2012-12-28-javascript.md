---
title: 'Getting Started - Javascript'

layout: nil
---

The Javascript SDK is the recommended way to integrate your app with NUSCloud.

### Setup

You can register a new app [here](http://nuscloud.jishnumohan.com/client/registration). Ensure that a correct domain is provided and take note of your app Id.

Include the following HTML code in your webpage to load the SDK.
 

```
<script src="http://nuscloud.jishnumohan.com/sdk/sdk.js"></script>
<script>
var host = "http://nuscloud.jishnumohan.com";
var redirect_url = "some-page-on-your-site";
var app_id = "your-app-id";
var permissions = "info-read";
var nuscloud = new NUSCloud(host, redirect_url, app_id, permissions);
</script>
```

###Details

Each element mentioned above is explained below

####Host

The URL hosting NUSCloud

####Redirect URL

When the user logs in, he/she is redirected momentarily (in a popup window) to a page of your website momentarily for your site to receive the relevant NUSCloud access token.

The point to note here is to provide a webpage of the same domain your app is running in (to receive the access token correctly) and the same domain provided to NUSCloud on registering your app (for security issues)

####App Id

This is a unique identifier for your app provided on registration.

####Permissions

This is a space separated string of the permissions you want to request the user for. As of now, the user can either accept or reject all permissions.

Permissions that can be requested are:

- **''info-read''** - to read users basic information (name, username, email)
- **''friends-read''** - to access friends of the user using the app and allow the user to be accessed by friends using the app
- **''(app-namespace)-read''** - this is if your app requires permission to read from other NUSCloud apps, where (app-namespace) refers to the namespace of the app you want to read data from (this is why NUSCloud is collaborative!)

###Requests

Other than authentication, discussed separately, all requests through the sdk are made in the following formats:

```nuscloud.get(path, callback)```

```nuscloud.post(path, data, callback)```

```nuscloud.delete(path, callback)```

where

- **path** is a URL path String
- **data** is an object
- **callback** is a function that takes in one response argument
