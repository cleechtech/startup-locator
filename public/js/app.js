
var app = angular.module('startup-locator', [
	'ui.router',
	'angularSpinner',
	'angular-storage',
	'formly',
	'formlyBootstrap'
], function($httpProvider){
	// will add token to header of requests if token is present
	$httpProvider.interceptors.push('authInterceptor');
});

app.run(function($rootScope, store){
	// if the user's data is in local storage
	// show them as signed in
	var user = store.get('sl-auth-user');
	if(user){
		$rootScope.user = user;
	}
});

app.constant('API_URL', 'api/');

// Routes
app.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: "/",
			templateUrl: "templates/main.html",
		});

	$urlRouterProvider.otherwise("/");
});