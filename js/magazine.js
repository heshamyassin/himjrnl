/*!
 *
 * HiM is a men lifestyle journal, issued on monthly basis, to cover all subjects of interest of the
 * modern-age rugged gentleman all over the world; from travel, business, entertainment, entrepreneurship,
 * finance, fashion, skills, gadgets and a lot more
 *
 * EDITOR IN CHIEF. Hesham Yasein. heshamgyassin@gmail.com
 *
 * All rights reserved to HiM 2023 (C)
 *
 * License:
 * This code is based on turnjs - http://turnjs.com
 * Copyright (C) 2012 Emmanuel Garcia
 * The turn.js project is released under the BSD license and it's available on GitHub.
 * This license doesn't include features of the 4th release.
 *
 * Opinions expressed are solely those of the contributors.
 * No part of this magazine may be reproduced or transmitted in any form or by any means without a written
 * permission of the publisher.
 *
 */

const magazineConsts = {
	width: 922,
	height: 600,
	duration: 1000,
	acceleration: !isChrome(),
	gradients: true,
	autoCenter: true,
	elevation: 50,
	pages: 34,
	pdfURL: 'https://drive.google.com/uc?id=1nEkBuxol0eCZ5J-TYvbTDMQZwckvKVhr&export=download'
}

window.onscroll = function() {scroll()};

function loadApp() {
	
	var flipbook = $('.magazine');

	// Check if the CSS was already loaded
	
	if (flipbook.width()==0 || flipbook.height()==0) {
		setTimeout(loadApp, 10);
		return;
	}

	loadMenu();

	/* Load Turning	Sound */
	var audio = document.getElementById("audio");
					
	// Create the flipbook
	flipbook.turn({
		
		width: magazineConsts.width,
		height: magazineConsts.height,
		duration: magazineConsts.duration,
		acceleration: magazineConsts.acceleration,
		gradients: magazineConsts.gradients,
		autoCenter: magazineConsts.autoCenter,
		elevation: magazineConsts.elevation,
		pages: magazineConsts.pages,
			
		// Events
		when: {
			turning: function(event, page, view) {
				
				var book = $(this),
				currentPage = book.turn('page'),
				pages = book.turn('pages');
				
				// Update the current URI

				Hash.go('page/' + page).update();

				// Show and hide navigation buttons

				disableControls(page);
				

				$('.thumbnails .page-'+currentPage).
					parent().
					removeClass('current');

				$('.thumbnails .page-'+page).
					parent().
					addClass('current');
				
				/* Play Turning	Sound */
				audio.play();

			},

			turned: function(event, page, view) {

				disableControls(page);

				$(this).turn('center');
				
				if (page==1) { 
					$(this).turn('peel', 'br');
				}

			},

			missing: function (event, pages) {

				// Add pages that aren't in the magazine
				for (var i = 0; i < pages.length; i++)
					addPage(pages[i], $(this));

			}
		}

	});
	
	// Zoom.js
	
	$('.magazine-viewport').zoom({
		flipbook: $('.magazine'),

		when: {

			swipeLeft: function() {

				$(this).zoom('flipbook').turn('next');

			},

			swipeRight: function() {
				
				$(this).zoom('flipbook').turn('previous');

			},

		}
	});
	
	// Using arrow keys to turn the page

	$(document).keydown(function(e){

		var previous = 37, next = 39, esc = 27;

		switch (e.keyCode) {
			case previous:

				// left arrow
				$('.magazine').turn('previous');
				e.preventDefault();

			break;
			case next:

				//right arrow
				$('.magazine').turn('next');
				e.preventDefault();

			break;
			case esc:
				
				$('.magazine-viewport').zoom('zoomOut');	
				e.preventDefault();

			break;
		}
	});

	// URIs - Format #/page/1 

	Hash.on('^page\/([0-9]*)$', {
		yep: function(path, parts) {
			var page = parts[1];

			if (page!==undefined) {
				if ($('.magazine').turn('is'))
					$('.magazine').turn('page', page);
			}

		},
		nop: function(path) {

			if ($('.magazine').turn('is'))
				$('.magazine').turn('page', 1);
		}
	});


	$(window).resize(function() {
		resizeViewport();
	}).bind('orientationchange', function() {
		resizeViewport();
	});

	// Add thumbnails
	
	addThumb();

	// Add shares

	addShare();
	
	// Events for thumbnails

	$('.thumbnails').click(function(event) {
		
		var page;

		if (event.target && (page=/page-([0-9]+)/.exec($(event.target).attr('class'))) ) {
		
			$('.magazine').turn('page', page[1]);

			toggleThumbnailPanel();
		}
	});

	$('.thumbnails li').
		bind($.mouseEvents.over, function() {
			
			$(this).addClass('thumb-hover');

		}).bind($.mouseEvents.out, function() {
			
			$(this).removeClass('thumb-hover');

		});

	if ($.isTouch) {
	
		$('.thumbnails').
			addClass('thumbanils-touch').
			bind($.mouseEvents.move, function(event) {
				event.preventDefault();
			});

	} else {

		$('.thumbnails ul').mouseover(function() {

			$('.thumbnails').addClass('thumbnails-hover');

		}).mousedown(function() {

			return false;

		}).mouseout(function() {

			$('.thumbnails').removeClass('thumbnails-hover');

		});
	}


	// Regions

	if ($.isTouch) {
		$('.magazine').bind('touchstart', regionClick);
	} else {
		$('.magazine').click(regionClick);	
	}

	// Events for the next button

	$('.next-button').bind($.mouseEvents.over, function() {
		
		$(this).addClass('next-button-hover');

	}).bind($.mouseEvents.out, function() {
		
		$(this).removeClass('next-button-hover');

	}).bind($.mouseEvents.down, function() {
		
		$(this).addClass('next-button-down');

	}).bind($.mouseEvents.up, function() {
		
		$(this).removeClass('next-button-down');

	}).click(function() {
		
		$('.magazine').turn('next');

	});

	// Events for the next button
	
	$('.previous-button').bind($.mouseEvents.over, function() {
		
		$(this).addClass('previous-button-hover');

	}).bind($.mouseEvents.out, function() {
		
		$(this).removeClass('previous-button-hover');

	}).bind($.mouseEvents.down, function() {
		
		$(this).addClass('previous-button-down');

	}).bind($.mouseEvents.up, function() {
		
		$(this).removeClass('previous-button-down');

	}).click(function() {
		
		$('.magazine').turn('previous');

	});

	resizeViewport();

	$('.magazine').addClass('animated');

}

function addPage(page, book) {

	var id, pages = book.turn('pages');

	// Create a new element for this page
	var element = $('<div />', {});

	// Add the page to the flipbook
	if (book.turn('addPage', element, page)) {

		// Add the initial HTML
		// It will contain a loader indicator and a gradient
		element.html('<div class="gradient"></div><div class="loader"></div>');

		// Load the page
		loadPage(page, element);
	}

}

function addShare() {
	var appendReg = document.getElementById('canvas');
	
	var shareReg = $('<div />', {'id': 'share-panel', 'style': 'position: absolute; float: right;', 'class': 'share-panel'});
	shareReg.appendTo(appendReg);

	var shareSpan = $('<span id="" style=""></span>');
	shareSpan.appendTo(shareReg);
	
	var topDownload = $('<i />', {id:"", title:"Download PDF", class:"shareItems fa fa-download"}); //onClick="downloadPDF()"
	var topSocialFB = $('<i />', {id:"", title:"Share to FB", class:"shareItems fa fa-facebook"}); //onClick="shareSM('Facebook')"
	var topSocialTR = $('<i />', {id:"", title:"Share to Twitter", class:"shareItems fa fa-twitter"}); //onClick="shareSM('Twitter')"
	var topSocialLI = $('<i />', {id:"", title:"Share to LinkedIn", class:"shareItems fa fa-linkedin"}); //onClick="shareSM('LinkedIn')"
	var topArchive = $('<i />', {id:"", title:"Go to Archive", class:"shareItems fa fa-archive"}); //onClick="openArchive()"

	topDownload.attr('onClick','downloadPDF()').appendTo(shareSpan);
	topSocialFB.attr('onClick','shareSM("Facebook")').appendTo(shareSpan);
	topSocialTR.attr('onClick','shareSM("Twitter")').appendTo(shareSpan);
	topSocialLI.attr('onClick','shareSM("LinkedIn")').appendTo(shareSpan);
	topArchive.attr('onClick','openArchive()').appendTo(shareSpan);
}

function addThumb() {
	var t = 1;
	var appendReg = document.getElementById('canvas');
	
	var thumbReg = $('<div />', {'id': 'thumbnails-panel', 'class': 'thumbnails-panel'});
	thumbReg.appendTo(appendReg);
	
	var thumbPanel = $('<div />', {'id': 'thumbnails-panel-list', 'class': 'thumbnails'});
	thumbPanel.appendTo(thumbReg);

	while (t <= magazineConsts.pages) {
		if (t == 1 || t == magazineConsts.pages) {
			var thumbnail = $('<li />', {'class': 'i'});
			thumbnail.appendTo(thumbPanel);
			var thumbnailImg = $('<img />', {'class': 'page-' + t});
			thumbnailImg.css({
				width: '76px',
				height: '100px'
			}).attr('src', 'resources/pages/'+t+'.png');
			thumbnailImg.appendTo(thumbnail);
		}
		else {
			var thumbnail = $('<li />', {'class': 'd-inline'});
			thumbnail.appendTo(thumbPanel);
			var thumbnailImg = $('<img />', {'class': "page-" + t});
			thumbnailImg.css({
				width: '76px', height: '100px'
			}).attr('src', 'resources/pages/' + t + '.png');
			thumbnailImg.appendTo(thumbnail);
			t++;
			var thumbnailImg = $('<img />', {'class': "page-" + t});
			thumbnailImg.css({
				width: '76px', height: '100px'
			}).attr('src', 'resources/pages/' + t + '.png');
			thumbnailImg.appendTo(thumbnail);
		}
		t++;
	}
}

function loadPage(page, pageElement) {

	// Create an image element

	var img = $('<img />');

	img.mousedown(function(e) {
		e.preventDefault();
	});

	img.load(function() {
		
		// Set the size
		$(this).css({width: '100%', height: '100%'});

		// Add the image to the page after loaded

		$(this).appendTo(pageElement);

		// Remove the loader indicator
		
		pageElement.find('.loader').remove();
	});

	// Load the page

	img.attr('src', 'resources/pages/' +  page + '.png');

	loadRegions(page, pageElement);

}

// Load regions

function loadRegions(page, element) {

	$.getJSON(('resources/regions/'+page+'-regions.json'),
		function(data) {

			$.each(data, function(key, region) {
				addRegion(page, region, element);
			});
		});
}

// Add region

function addRegion(page, region, pageElement) {
	
	var reg = $('<div />', {'id': 'region-'+region['class'], 'class': 'region '+region['class']}),
		options = $('.magazine').turn('options'),
		pageWidth = options.width/2,
		pageHeight = options.height;

	reg.css({
		top: Math.round(region.y/pageHeight*100)+'%',
		left: Math.round(region.x/pageWidth*100)+'%',
		width: Math.round(region.width/pageWidth*100)+'%',
		height: Math.round(region.height/pageHeight*100)+'%',
		/*background: region['color'],*/
		border: '0'
	}).attr('region-data', $.param(region.data||''));

	reg.appendTo(pageElement);

	if (region['class'] == 'pinterest' || region['class'] == 'iframe' || region['class'] == 'video'
	|| region['class'] == 'gif' || region['class'] == 'twitter-timeline'
	|| region['class'] == 'twitter-tweet' || region['class'] == 'instagram-media'
	|| region['class'] == 'instagram-feed') {
		reg.css({opacity: '1'});
		$('.magazine-viewport').data().regionClicked = true;
		setTimeout(function() {
			$('.magazine-viewport').data().regionClicked = false;
		}, 100);
		processRegion(reg, region['class'], region);
	}
	else if (region['class'] == 'link')
		reg.css({zIndex:'1'});
}

// Process click on a region

function regionClick(event) {

	var region = $(event.target);

	if (region.hasClass('region')) {

		$('.magazine-viewport').data().regionClicked = true;
		
		setTimeout(function() {
			$('.magazine-viewport').data().regionClicked = false;
		}, 100);
		
		var regionType = $.trim(region.attr('class').replace('region', ''));

		return processRegion(region, regionType);

	}

}

// Process the data of every region

function processRegion(regionElement, regionType, regionJSON) {

	var data = decodeParams(regionElement.attr('region-data'));
	
	switch (regionType) {
		case 'link' :
			window.open(data.url);
		break;
		case 'instagram-feed':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			regionElement.css({borderRadius:'8px'});
			var instagramBlock = $('<iframe ></iframe><script async src="lib/instagram.js" charset="utf-8"></script>', {'id': 'myInstagram', 'class': 'instagram-feed'});
			instagramBlock.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				background: regionJSON['color'],
				zIndex: '0',
				border: '0',
				display: 'inline',
				overflow: 'scroll',
				borderRadius: '8px'
			}).attr('src', data.url);
			instagramBlock.appendTo(regionElement);
		break;
		case 'instagram-media':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			regionElement.css({borderRadius:'8px'});
			var instagramBlock = $('<blockquote class="instagram-media" data-instgrm-version="14" data-instgrm-permalink='+data.url+'></blockquote><script async src="lib/instagram.js" charset="utf-8"></script>', {'id': 'myInstagram', 'class': 'instagram-media'});
			instagramBlock.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				background: regionJSON['color'],
				zIndex: '0',
				border: '0',
				display: 'inline',
				overflow: 'scroll',
				borderRadius: '8px'
			});
			instagramBlock.appendTo(regionElement);
		break;
		case 'twitter-tweet':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			var twitterBlock = $('<blockquote class="twitter-tweet"><a href='+data.url+'></a></blockquote><script async src="lib/twitter.js" charset="utf-8"></script>', {'id': 'myTwitter', 'class': 'twitter-tweet'});
			twitterBlock.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				background: regionJSON['color'],
				zIndex: '0',
				border: '0',
				display: 'inline',
				overflow: 'scroll'
			});
			twitterBlock.appendTo(regionElement);
		break;
		case 'twitter-timeline':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			var twitterBlock = $('<a class="twitter-timeline" data-height="500" data-theme="light" href='+data.url+'></a><script async src="lib/twitter.js" charset="utf-8"></script>', {'id': "myTwitter", 'class': "twitter-timeline"});
			twitterBlock.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				background: regionJSON['color'],
				zIndex: '0',
				border: '0',
				display: 'inline',
				overflow: 'scroll'
			});
			twitterBlock.appendTo(regionElement);
		break;
		case 'gif':
			regionElement.css({zIndex:'0'});
			var gifPlayer = $('<img />', {'id': 'myGif', 'class': ''});
			gifPlayer.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				zIndex: '0',
				border: '0'
			}).attr('src', data.url);
			if (regionJSON.autoplay)
				gifPlayer.attr('autoplay', '');
			gifPlayer.appendTo(regionElement);
		break;
		case 'video':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			var videoPlayer = $('<video controls loop allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"/>', {'id': 'myVideo', 'class': ''});
			videoPlayer.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				zIndex: '1',
				background: regionJSON['color'],
				border: '0'
			}).attr('src', data.url);
			if (regionJSON.autoplay)
				videoPlayer.attr('autoplay', '');
			videoPlayer.appendTo(regionElement);
		break;
		case 'iframe':
			regionElement.css({zIndex:'1'});
			regionElement.css({background:regionJSON['color']});
			var videoPlayer = $('<iframe allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/>', {'id': 'myiframe', 'class': ''});
			videoPlayer.css({
				top: 'regionElement.y',
				left: 'regionElement.x',
				width: '100%',
				height: '100%',
				opacity: '1',
				zIndex: '1',
				background: regionJSON['color'],
				border: '0',
			}).attr('src', data.url);
			if (regionJSON.autoplay)
				videoPlayer.attr('src', data.url+"?autoplay=1");
			videoPlayer.appendTo(regionElement);
		break;
	}
}


// http://code.google.com/p/chromium/issues/detail?id=128488

function isChrome() {

	return navigator.userAgent.indexOf('Chrome')!=-1;

}

function disableControls(page) {
		if (page==1)
			$('.previous-button').hide();
		else
			$('.previous-button').show();
					
		if (page==$('.magazine').turn('pages'))
			$('.next-button').hide();
		else
			$('.next-button').show();
}

// Set the width and height for the viewport

function resizeViewport() {

	var deviceWidth = $(window).width(),
		deviceHeight = $(window).height(),
		options = $('.magazine').turn('options'),
		pageWidth = options.width/2,
		pageHeight = options.height,
		responsiveViewTreshold = 768,
		currPage = $('.magazine').turn('page');

	$('.magazine-viewport').css({
		width: deviceWidth,
		height: deviceHeight
	}).zoom('resize');

	if ($('.magazine').turn('zoom')==1) {
		var boundWidth = Math.min(options.width, deviceWidth),
		boundHeight = Math.min(options.height, deviceHeight),
		boundScale = boundWidth / boundHeight,
        pageScale = pageWidth / pageHeight,
		viewScale = 1;

		$('.magazine').removeClass('animated');

		if (boundWidth <= responsiveViewTreshold && boundScale < 2 * pageScale)
		{
			if (boundScale < pageScale) {
				viewScale = 0.75 * boundScale / (pageScale * 0.80);
			} else {
				viewScale = 1;
			}
			
			$('.magazine').turn('size', 2*viewScale*boundWidth, viewScale*boundHeight);
			$('.magazine').css({top: -viewScale*boundHeight/2, left: -viewScale*boundWidth});

			$('.next-button').css({height: 2*viewScale*boundHeight, backgroundPosition: '-3.5vw'});
			$('.previous-button').css({height: viewScale*boundHeight, backgroundPosition: '-3.5vw'});
		}
		else
		{
			if (boundScale < pageScale * 2) {
				viewScale = 0.75 * boundScale / (2 * pageScale * 0.80);
			} else {
				viewScale = 1;
			}

			$('.magazine').turn('size', viewScale*boundWidth, viewScale*boundHeight);
			//$('.magazine').turn('center', viewScale*boundWidth, viewScale*boundHeight);
			$('.magazine').css({top: -viewScale*boundHeight/2, left: -viewScale*boundWidth/2});

			$('.next-button').css({height: viewScale*boundHeight, backgroundPosition: '-3.5vw'});
			$('.previous-button').css({height: viewScale*boundHeight, backgroundPosition: '-3.5vw'});
		}

		if (currPage==1)
			$('.magazine').turn('peel', 'br');
	}

	var magazineOffset = $('.magazine').offset();

	if (magazineOffset.top<$('.made').height())
		$('.made').hide();
	else
		$('.made').show();

	$('.magazine').addClass('animated');

	loadMenu();
}
// decode URL Parameters

function decodeParams(data) {

	var parts = data.split('&'), d, obj = {};

	for (var i =0; i<parts.length; i++) {
		d = parts[i].split('=');
		obj[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
	}

	return obj;
}

function toggleShareMenu() {
	const sharePanel = document.getElementById("share-panel");
	const shareButton = document.getElementById("shareButton");
	var deviceWidth = $(window).width();
	var responsiveViewTreshold = 768;
	
	if (deviceWidth > responsiveViewTreshold) {
		if (thumbPanel.style.display === "none") {
			//
		} else {
			//
		}
	} else {
		if (sharePanel.style.display === "none") {
			sharePanel.style.display = "inline-flex";
			shareButton.className = 'top-share fa fa-close';
		} else {
			sharePanel.style.display = "none";
			shareButton.className = 'top-share fa fa-share';
		}
	}
}

function toggleThumbnailPanel() {
	const thumbPanel = document.getElementById("thumbnails-panel");
	const thumbnails = document.getElementById("thumbnails-panel-list");
	const thumbButton = document.getElementById("thumbButton");
	var deviceWidth = $(window).width(),
	responsiveViewTreshold = 768;
	
	if (deviceWidth > responsiveViewTreshold) {
		if (thumbPanel.style.display === "none") {
			thumbPanel.style.display = "inline-block";
			$('.magazine-viewport .container').css({
				left: 'calc((100vw - var(--thumbnail-panel-width))/2 + var(--thumbnail-panel-width))'
			});
			thumbPanel.style.width = 'var(--thumbnail-panel-width)';
			thumbnails.style.left = 'calc(var(--thumbnail-panel-width)/2 - 76px)';
			thumbPanel.style.height = '100%';
			thumbButton.className = 'top-thumb fa fa-close';
		} else {
			thumbPanel.style.display = "none";
			$('.magazine-viewport .container').css({left: '50%'});
			thumbButton.className = 'top-thumb fa fa-bars';
		}
	} else {
		if (thumbPanel.style.display === "none") {
			$('.magazine-viewport .container').css({
				display: 'none'
			});
			thumbPanel.style.display = "inline-block";
			thumbPanel.style.width = '100vw';
			thumbnails.style.left = 'calc(50% - 76px)';
			thumbPanel.style.height = 'auto';
			thumbButton.className = 'top-thumb fa fa-close';
		} else {
			thumbPanel.style.display = "none";
			$('.magazine-viewport .container').css({
				display: "block"
			});
			thumbButton.className = 'top-thumb fa fa-bars';
		}
	}
}

function downloadPDF() {
	window.open(magazineConsts.pdfURL)
}

function shareSM(platform) {
	switch (platform) {
		case 'Facebook':
			window.open('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhgyassin.github.io%2Fhimjrnl');
			break;
		case 'Twitter':
			window.open('https://twitter.com/intent/tweet?text=https%3A%2F%2Fhgyassin.github.io%2Fhimjrnl');
			break;
		case 'LinkedIn':
			window.open('http://www.linkedin.com/shareArticle?mini=true&url=https://hgyassin.github.io/himjrnl&source=https://hgyassin.github.io/himjrnl');
			break;
	}

}

function openArchive() {
	const page = window.open("archive/archive.html", "_self", "");
}

function loadMenu() {
	const element = document.getElementById("canvas");
	var deviceWidth = $(window).width();
	var responsiveViewTreshold = 768;

	var topPanel = $('<div />', {id:"top-panel", class:"top-panel"});
	const topPanelElement = document.getElementsByClassName('top-panel');
	
	if (deviceWidth <= responsiveViewTreshold) {
		// remove the topPanel and its contents
		for (let p = 0; p < topPanelElement.length; p++) {
			topPanelElement[p].remove();
		}
		mobileMenu(topPanel);
		topPanel.appendTo(element);
	} else {
		// remove the topPanel and its contents
		for (let p = 0; p < topPanelElement.length; p++) {
			topPanelElement[p].remove();
		}
		desktopMenu(topPanel);
		topPanel.appendTo(element);
	}
}

function mobileMenu(topPanel) {
	mobileThumbnail(topPanel);
	
	var spanLogo = $('<span style="transform: translateY(-45%)"/>', {id:"", class:""});
	const spanLogoContent = $('<h1 style="color:#FFFFFF; font:35px Bebas Neue Cyrillic">THE</h1> \
	<h1 style="color:#111F4A; font:35px Giaza Stencil">HiM</h1> \
	<h1 style="color:#111F4A; font:35px Bebas Neue Cyrillic">JOURNAL</h1>', {id:"", class:""});;
	spanLogoContent.appendTo(spanLogo);
	spanLogo.appendTo(topPanel);
	
	var loginButton = $('<a id="" title="Login/SignUp" style="top-share" href="https://hgyassin.github.io?msopen=/member/account"> \
	<i id="" class="top-share fa fa-user"></i></a>'); 
	loginButton.appendTo(topPanel);

	mobileShare(topPanel);
}

function desktopMenu(topPanel) {

	desktopThumbnail(topPanel);
	
	var spanLogo = $('<span style="transform: translateY(-45%)"/>', {id:"", class:""});
	const spanLogoContent = $('<h1 style="color:#FFFFFF; font:35px Bebas Neue Cyrillic">THE</h1> \
	<h1 style="color:#111F4A; font:35px Giaza Stencil">HiM</h1> \
	<h1 style="color:#111F4A; font:35px Bebas Neue Cyrillic">JOURNAL</h1>', {id:"", class:""});;
	spanLogoContent.appendTo(spanLogo);
	spanLogo.appendTo(topPanel);
	
	var loginButton = $('<a id="" title="Login/SignUp" style="top-download" href="https://hgyassin.github.io?msopen=/member/account"> \
	<i id="" class="top-download fa fa-user"></i></a>'); 
	loginButton.appendTo(topPanel);
	
	desktopShare(topPanel);
}

function mobileThumbnail(topPanel) {
	var topThumb = $('<i />', {id:"thumbButton", title:"Open Thumbnails", class:"top-thumb fa fa-bars"});
	topThumb.attr('onClick','toggleThumbnailPanel()').appendTo(topPanel);
}

function desktopThumbnail(topPanel) {
	var topThumb = $('<i />', {id:"thumbButton", title:"Open Thumbnails", class:"top-thumb fa fa-bars"});
	topThumb.attr('onClick','toggleThumbnailPanel()').appendTo(topPanel);
}

function mobileShare(topPanel) {
	// create a new menu similar to #top-panel .top-thumb and code shall be similar to toggleThumbnailPanel()
	// call mobileShare to attach to this menu
	var topShare = $('<i />', {id:"shareButton", title:"Share To", class:"top-share fa fa-share"});
	topShare.attr('onClick','toggleShareMenu()').appendTo(topPanel);
}

function desktopShare(topPanel) {
	var topDownload = $('<i />', {id:"", title:"Download PDF", class:"top-download fa fa-download"}); //onClick="downloadPDF()"
	var topSocialFB = $('<i />', {id:"", title:"Share to FB", class:"top-download fa fa-facebook"}); //onClick="shareSM('Facebook')"
	var topSocialTR = $('<i />', {id:"", title:"Share to Twitter", class:"top-download fa fa-twitter"}); //onClick="shareSM('Twitter')"
	var topSocialLI = $('<i />', {id:"", title:"Share to LinkedIn", class:"top-download fa fa-linkedin"}); //onClick="shareSM('LinkedIn')"
	var topArchive = $('<i />', {id:"", title:"Go to Archive", class:"top-download fa fa-archive"}); //onClick="openArchive()"

	topDownload.attr('onClick','downloadPDF()').appendTo(topPanel);
	topSocialFB.attr('onClick','shareSM("Facebook")').appendTo(topPanel);
	topSocialTR.attr('onClick','shareSM("Twitter")').appendTo(topPanel);
	topSocialLI.attr('onClick','shareSM("LinkedIn")').appendTo(topPanel);
	topArchive.attr('onClick','openArchive()').appendTo(topPanel);
}

function scroll() {
	var footer = document.getElementsByTagName('footer');
	var footerDiv = footer[0].getElementsByTagName('div');
	var footerSpan = footerDiv[0].getElementsByTagName('span');
	var scrollBottomEl = document.getElementById('scrollToBottom');
	var scrollToTopElement = footerSpan[0].getElementsByTagName('i');
	var scrollToTopIcon = footerSpan[0].getElementsByTagName('a');
	var scrollToTop = $('<i title="Scroll to Top" style="float: right; padding: 1em 1em 1em 0.25em !important; margin: 1em 1em 1em 0.25em !important; color: #111F4A; cursor: pointer; align-items: center; transform: translateY(5%); font-size: min(max(12px, 2vw), 18px)" class="fa fa-angle-double-up" id="scrollTopIc" onClick="scrollToTop()"></i>');
	
	if (document.scrollTop > 10 || document.documentElement.scrollTop > 10) {
		for (let s = 0; s < scrollToTopElement.length; s++) {
			scrollToTopElement[s].remove();
			scrollToTopIcon[s].remove();
		}
		scrollToTop.appendTo(footerSpan[0]);
		scrollBottomEl.style.display = "none";
	} else {
		for (let s = 0; s < scrollToTopElement.length; s++) {
			scrollToTopElement[s].remove();
			scrollToTopIcon[s].remove();
		}
		scrollBottomEl.style.display = "block";
	}
}

function scrollToBottom() {
	document.body.scrollTop = 100;
  	document.documentElement.scrollTop = 100;
}

function scrollToTop() {
	document.body.scrollTop = 0;
  	document.documentElement.scrollTop = 0;
}