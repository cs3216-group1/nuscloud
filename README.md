# NUSCloud

Unified backend service for NUS Apps for:

 - Convenient data storage and authentication for single page apps
 - Data sharing and portability across NUS Apps with user permissions

##  Usage

NUSCloudPlatform relies on the Oauth2.0 protocol for authentication and API Access - in particular, the implicit flow authentication - as implemented in the Javascript SDK at js-sdk/sdk.js is recommended.

### Registration and Account

New users can register at /registration and can view account details at /account

When users are logged in, they can create client applications at /client/registration

Users can view details of created apps at /account/appdetails

### Login

The standard flow login endpoint is /login
The implicit flow login endpoint is /loginImplicit
Logout endpoint is at /logout

### API and Scope

The included API endpoints are get and post to /me/info.
These require 'info-read' and 'info-write' permissions respectively.

### Javascript SDK

The included file js-sdk/sdk.js can be used to execute login, logout and api calls through Javascript.

The example js-sdk/index.html includes a demonstration of login, get and post of information.

