# NUSCloud

Unified backend service for NUS Apps with the following features:

 - Convenient data storage and authentication for single page apps
 - Easy IVLE LAPI Integration
 - Data sharing and portability across apps with user permissions
 - Data sharing between friends

A more convenient version of this documentation can be found [here](http://docs.nuscloud.com)

## Overview

NUSCloud aims to be a collaborative backend service for applications serving the NUS community, hosted [here](http://nuscloud.com). To achieve this, it exposes an API to applications allowing them to authenticate users, to store data, and for users to share data across applications.

Through this, NUSCloud aims to minimize redundancy both in terms of developer code and user data entry - improving experience across the board and hopefully contributing to boost application development and growth targeted to NUS students. 

### API Details

NUSCloud exposes a REST-like API which can be accessed via HTTP requests. To simplify integration for client-side applications, the use of the Javascript SDK is strongly recommended.

With the exception of login and logout endpoints, all API paths below are relative to *http://nuscloud.com/api/* for HTTP requests. Details for the Javascript SDK are given in its dedicated section.

## Getting Started - Javascript

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

### Details

Each element mentioned above is explained below:

#### Host

The URL hosting NUSCloud

#### Redirect URL
 
When the user logs in, he/she is redirected momentarily (in a popup window) to a page of your website momentarily for your site to receive the relevant NUSCloud access token.

All that is required is to provide a URL of the same domain your app is running in (to receive the access token correctly) and the same domain provided to NUSCloud on registering your app (for security issues). Once the redirect is completed, the sdk will automatically store the access token and close the popup, so the content on the URL is immaterial.

However, it is recommended that the page be as lightweight as possible (or blank) to minimize loading times and thus delays in the login flow.

#### App Id

This is a unique identifier for your app provided on registration.

#### Permissions

This is a space separated string of the permissions you want to request the user for. As of now, the user can either accept or reject all permissions.

Permissions that can be requested are:

- **''info-read''** - to read users basic information (name, username, email)
- **''friends-read''** - to access friends of the user using the app and allow the user to be accessed by friends using the app
- **''(app-namespace)-read''** - this is if your app requires permission to read from other NUSCloud apps, where (app-namespace) refers to the namespace of the app you want to read data from (this is why NUSCloud is collaborative!)
- **''ivle-read'' - to read users IVLE information
- ""''ivle-write'' - to write to IVLE data (send POST requests to IVLE)

### Requests

Other than authentication, all requests through the sdk are made in the following formats:

```nuscloud.get(path, callback)```

```nuscloud.post(path, data, callback)```

```nuscloud.delete(path, callback)```

The arguments expected above are:

- **path** is a URL path String
- **data** is an object
- **callback** is a function that takes in one response argument

### Responses

The response format will be the JSON string representation of the object types specified.

Each response will have a *status* attribute, and other attributes specific to each method.


### Quickstart

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

## Getting Started - IVLE

If you are building an app catering to NUS, you might want to include IVLE Login in order to make use of the data exposed by the [IVLE LAPI](https://wiki.nus.edu.sg/display/ivlelapi/IVLE+LAPI+Overview). NUSCloud supports a convenient way to do this integration.

### Features

Using NUSCloud's IVLE integration offers a number of advantages:
* Avoid exposing IVLE LAPI Key online. Currently, when building a client side application, your app's key would have to be included in the Javascript - which is not very secure.
* Key and Token management - NUSCloud stores your applications API Key and the generated auth tokens as well as token refreshing, removing the need to store user tokens in a database or force user to provide IVLE credentials in each login.
* Allow your app to benefit from user data in applications like [NUSMods+](nusmods.nuscloud.com) as well as IVLE without implementing two separate login flows

How:
* NUSCloud proxies your IVLE requests by adding the authentication parameters, and provides the responses to your application.

Please note that:
* NUSCloud does not cache any IVLE data, so speeds might be slow for large requests.
* IVLE access is limited to the logged-in user. Accessing friends IVLE data is currently not supported.

### Setup

When registering an app [here](http://nuscloud.com/client/registration), enter a valid IVLE LAPI Key. This key can be found [here](http://ivle.nus.edu.sg/LAPI/default.aspx).

This would allow NUSCloud to make requests to IVLE LAPI on the behalf of your app.

### Usage

IVLE integration can be done in your app by including the **ivle-read** and/or **ivle-write** in your requested permissions.

If either of these permissions are requested, when user is logging in to your app for the first time, the user would be asked to authenticate your application to IVLE after allowing permissions. Similar to the normal login flow, the popup will close automatically on succesful authentication.

Your app can now succesfully make requests to IVLE through NUSCloud when the user is logged in.

### Requests

To make requests to IVLE, the /ivle enpoint is used:

```nuscloud.get('ivle/:path', callback)```

```nuscloud.post('ivle/:path', data, callback)```

The path to be used is based on the UriTemplate of the resource as specified by the [LAPI reference](https://wiki.nus.edu.sg/display/ivlelapi/LAPI+Reference) without the prefix *https://ivle.nus.edu.sg/api/Lapi.svc/*.

Further, arguments for the APIKey and Token / AuthToken are ignored as these are added by NUSCloud as described earlier.

To illustrate with an example:

A GET request to:

```https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Taken?APIKey={System.String}
    &AuthToken={System.String}&StudentID={System.String}```

can be made via:

```nuscloud.get('ivle/Modules_Taken?StudentID={String}', callback);```

### Responses

The format of the response passed to the callback will be the JSON string representation of the object types specified in each method where:

- **status** is the status
- **ivleResponse** is an object

## Authenticate - Javascript

### Login

Login through the SDK is straightforward. If the nuscloud object is initialized as earlier:

```nuscloud.login(callback)```

will initiliaze login. 

If the user is already logged in to NUSCloud and has provided all requested permissions to your app, there will not be any prompt. Else, he will be prompted to login via a NUSCloud popup and further prompted to provide any requested permissions.

No arguments are passed to the callback from login, so it is recommended that [getLoginStatus](/#status) be chained after login to confirm success.

### Logout

Logout is also straightforward

```nuscloud.logout(callback)```

will logout the user from the app by deactivating any access tokens provided.

### Status

```nuscloud.getLoginStatus(callback)```

will provide the users status as a response to the callback. The possible results are:

- **{status: unknown}** - if the user is not logged into NUSCloud
- **{status: unauthorized}** - if the user is logged in and has not authorized the app
- **{status: connected}** - user is logged in and app has a valid token

## Get user info

This method returns users basic info.

```nuscloud.get('/:userId/userinfo', callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **me** for **:userId** to get info of the logged in user

Requires **info-read** permission

### Response

Sends back an object containing info of the user.

```{
    status: 'ok',
    info: {
        userId: 'abcdefgh12',
        username: 'johndoe',
        name: 'John Doe',
        email: 'johndoe@nus.edu.sg'
    }
}```

## Get app info

This method returns users basic info.

```nuscloud.get('/:appId/appinfo', callback);```

This method returns the basic info of the app which is logged in.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **app** for **:appId** to get info of the logged in user

### Response

Sends back an object containing info of the user.

```{
    status: 'ok',
    info: {
        name: 'Cool App',
        namespace: 'coolapp'
    }
}```

## Get friends

This method returns users friends using the app.

```nuscloud.get('/:userId/friends', callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **me** for **:userId** to get info of the logged in user

Requires **friends-read** permission

### Response

Sends back an object containing list of friends of the user.

```{
    status: 'ok'
    friends: [
        { 
            name: 'Good Friend'
            userId: 'defgh1234'
        },
        {
            name: 'Tom Tomson'
            userId: 'tomtom123'
        }
    ]
}```

## Get user data for app

This method returns users data for the specified app at the specified path.

```nuscloud.get('/:userId/:appId/*', callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

Special cases of this request substitute **me** for **:userId** to get info of the logged in user and/or **app** for **:appid** to get data for current logged in app.

If not made by the app itself, requires **(app-namespace)-read** permission, where (app-namespace) is the namespace of the app whose data would be read.

To get data of a user who is not logged in, the following conditions must be met:
* The target user must have signed into the app
* The target user must be a friend of the logged-in user
* Both the target user and the logged-in user must have enabled the **friends-read** permission

### Response

Sends back an object containing info stored at the path.

This endpoint supports nesting. In a case where a request to */me/app/example* returns this:

```{
    status: 'ok',
    data: {
        category: 'basket',
        apples: 3,
        type: 'fresh',
    }
}```

Then a request to */me/app/example/apples* would return this:

```{
    status: 'ok',
    data: 3 
}```

## Edit user data for app

This method edits user info for the app at the specified path.

```nuscloud.post('/:userId/:appId/*', data, callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

* **Request body sent cannot be empty** and must include a **data** attribute containing the data to be put at the specified path. The data attribute is expected to be a Javascript Object. If the SDK is being used, the data attribute can contain any Javascript primitive data type (Number, String, Boolean)

Special cases of this request substitute **me** for **:userId** to edit info of the logged in user and/or **app** for **:appid** to edit data for currently logged in app.

As of now, this request can only be made by the currently logged in app to edit data of the logged in user.

This endpoint supports nesting. A request to */me/app/example* with this data:

```{
    data: {
        apples: 3
    }
}```

Is equivalent to this request to */me/app/example/apples*:

```{
    data: 3 
}```

### Response

The response contains the status of the operation.

```{
    status: 'ok' 
}```

## Delete user data for app

This method deletes users data for the specified app at the specified path.

```nuscloud.delete('/:userId/:appId/*', callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

Special cases of this request substitute **me** for **:userId** to delete info of the logged in user and/or **app** for **:appid** to delete data for current logged in app.

As of now, this request can only be made by the currently logged in app.

### Response

Returns the status of the delete operation.

```{
    status: 'ok'
}```

## Get IVLE data for user

This method returns users data for the IVLE resource as specified by **path**.

```nuscloud.get('/ivle/:path/*', callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

This request requires user to have granted a **ivle-read** permission and have authenticated the app using IVLE. It also requires that the app have been registered on NUSCloud with a valid IVLE LAPI Key as this will allow NUSCloud to make requests on behalf of the app.

The path to be used is based on the UriTemplate of the resource as specified by the [LAPI reference](https://wiki.nus.edu.sg/display/ivlelapi/LAPI+Reference) without the prefix *https://ivle.nus.edu.sg/api/Lapi.svc/*.

Further, arguments for the APIKey and Token / AuthToken are ignored as these are added by NUSCloud.

To illustrate with examples:

To get NUS ID of user, a GET request to:

```https://ivle.nus.edu.sg/api/Lapi.svc/UserID_Get?APIKey={System.String}
    &Token={System.String}```

can be made via:

```nuscloud.get('/ivle/UserID_Get', callback);```

To get modules taken by user, a GET request to:

```https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Taken?APIKey={System.String}
    &AuthToken={System.String}&StudentID={System.String}```

can be made via:

```nuscloud.get('ivle/Modules_Taken?StudentID={String}', callback);```

### Response

Sends back an object containing the resource as specified by the **path**.

```{
    status: 'ok',
    ivleResponse: {response from IVLE} 
}```

## Edit/Add IVLE data for user

This method edits the IVLE resource of the user as specified by **path**.

```nuscloud.post('/ivle/:path/*', data, callback);```

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

This request requires user to have granted a **ivle-write** permission and have authenticated the app using IVLE. It also requires that the app have been registered on NUSCloud with a valid IVLE LAPI Key as this will allow NUSCloud to make requests on behalf of the app.

The path to be used is based on the UriTemplate of the resource as specified by the [LAPI reference](https://wiki.nus.edu.sg/display/ivlelapi/LAPI+Reference) without the prefix *https://ivle.nus.edu.sg/api/Lapi.svc/*.

Further, arguments for the APIKey and Token / AuthToken are ignored as these are added by NUSCloud.

To illustrate with examples:

To post a new forum thread (JSON), a POST request to:

```https://ivle.nus.edu.sg/api/Lapi.svc/Forum_PostNewThread_JSON```

with the data:

```{
    APIKey: {APIKey},
    AuthToken: {AuthToken},
    HeadingID: {Heading to which thread is posted},
    Title: {Title of thread},
    Reply: {Message body}
}```

can be made via:

```nuscloud.post('/ivle/Forum_PostNewThread_JSON', callback);```

with the data:

```{
    HeadingID: {Heading to which thread is posted},
    Title: {Title of thread},
    Reply: {Message body}
}```

### Response

Sends back an object containing the response from IVLE.

```{
    status: 'ok',
    ivleResponse: {response from IVLE}
}```

## Status Codes


Each operation returns a response with a status attribute. If the status is **ok**, all is good. Else possible errors are:,

- **{status: error}** - Unrecognized error
- **{status: bad token}** - Invalid token
- **{status: bad endpoint}** - This endpoint does not specify a resource
- **{status: unauthorized}** - Absence of required permissions
- **{status: absent}** - Recognizes the endpoint, but currently has no data
- **{status: no apikey}** - App does not have stored API Key to make IVLE Request
- **{status: bad ivle request}** - Error thrown from IVLE

