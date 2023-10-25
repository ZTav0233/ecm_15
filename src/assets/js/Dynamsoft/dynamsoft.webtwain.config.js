//
// Dynamsoft JavaScript Library for Basic Initiation of Dynamic Web TWAIN
// More info on DWT: http://www.dynamsoft.com/Products/WebTWAIN_Overview.aspx
//
// Copyright 2017, Dynamsoft Corporation 
// Author: Dynamsoft Team
// Version: 13.1
//
/// <reference path="dynamsoft.webtwain.initiate.js" />
var Dynamsoft = Dynamsoft || {WebTwainEnv: {}};

Dynamsoft.WebTwainEnv.AutoLoad = true;

///
Dynamsoft.WebTwainEnv.Containers = [{ContainerId: 'dwtcontrolContainer', Width: 550, Height: 350}];

/// If you need to use multiple keys on the same server, you can combine keys and write like this 
/// Dynamsoft.WebTwainEnv.ProductKey = 'key1;key2;key3';
Dynamsoft.WebTwainEnv.ProductKey = '0744B54482F7E825EC63CC1BC7756E3C0715B549D8A79B2D0669530C53227B5C92ACA68C1319B61E47926F3BD62DB96E92ACA68C1319B61E04E53B2256C8C8EF0715B549D8A79B2DC5BB6C2877F34B6640000000;t0068WQAAAJh0ISnlz4AP12HX35zaf5zr2Szo9R78HkizySW04CGDkvNiSKNngVV0Ym7G2BeF/5KcXwi6ZpapyBoJsgeVAPo=';

///
Dynamsoft.WebTwainEnv.Trial = true;

///
Dynamsoft.WebTwainEnv.ActiveXInstallWithCAB = false;

///
// Dynamsoft.WebTwainEnv.ResourcesPath = 'Resources';

/// All callbacks are defined in the dynamsoft.webtwain.install.js file, you can customize them.
// Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', function(){
// 		// webtwain has been inited
// });

