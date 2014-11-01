# NUSCloud

Unified backend service for NUS Apps for:

 - Convenient data storage and authentication for single page apps
 - Data sharing and portability across NUS Apps with user permissions

##  Usage

NUSCloudPlatform relies on the Oauth2.0 protocol for authentication and API Access

Using the implicit flow authentication is recommended. 

The included Javascript SDK at js-sdk/sdk.js might be helpful.

### Registration and Account

New users can register at /registration and can view account details at /account

When users are logged in, they can create client applications at /client/registration

Users can view details of created apps at /account/appdetails

### Login

The standard flow login endpoint is /login

The implicit flow login endpoint is /loginImplicit

Logout endpoint is at /logout

With the sdk, this can be achieved by sdk.login() and sdk.logout() respectively

### API and Scope

The included API endpoints are get and post to /me/info.

These require 'info-read' and 'info-write' permissions respectively.

Dummy data for friends is accessible at /me/friends

This requires 'friends-read' permission

Client applications can store and retrieve data for the user at the /me/app/ endpoints

No special permissions are needed for this

For storage of data, the expected format of data for the sdk is an bject, where the data to be added is under the key 'data'.

For example, if the string 'Hello World' to be added to /me/app/helloworld, the argument to execute is 

<pre><code>sdk.post('me/app/helloworld', {'data': 'Hello World'});</code></pre>

Nesting is supported in app-specific endpoints. For example, after the above example is executed, a sdk get to /me/app will return the JSON encoding of { status: 'ok', data: {helloworld: 'Hello World'} }

Note that if the sdk is not used and direct get and post requests are made to the REST API then:
- Requests should be authenticated with the access token using authorization header and bearer strategy
- The api urls to request is found by using the prefix /api/ to the endpoints discussed earlier
- The login and logout urls are unchanged

### Javascript SDK

The included file js-sdk/sdk.js can be used to execute login, logout and api calls through Javascript.

The example js-sdk/index.html includes a demonstration of login, get and post of information.

