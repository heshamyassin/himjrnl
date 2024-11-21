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
 * wavesurfer.js 5.0.1 (2021-05-05)
 * https://wavesurfer-js.org
 * @license BSD-3-Clause
 *
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
	pdfURL: 'https://drive.google.com/uc?id=13PyoVuL9I9lSABsgx64hUCahfXHWRh6F&export=download'
}

function loadMagazine() {
	
	var flipbook = $('.magazine'),
	mgznCntr = $("#magazineContainer");
	
	initializeMagazine();

	mgznCntr.css({height: 1.2*magazineConsts.height});
	flipbook.css({
		top: 0.1*magazineConsts.height,
		left: ($(window).width() - 0.5*magazineConsts.width)/2
	});
	// left: ($(window).width() - 0.5*magazineConsts.width)/2
	
	// Check if the CSS was already loaded
	if (flipbook.width()==0 || flipbook.height()==0) {
		setTimeout(loadMagazine, 10);
		return;
	}

	loadMagazineMenu();

	loadMagazineEditions();

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
		magazineResizeViewport();
	}).bind('orientationchange', function() {
		magazineResizeViewport();
	});

	// Events for thumbnails

	$('.thumbnails').click(function(event) {
		
		var page;

		if (event.target && (page=/page-([0-9]+)/.exec($(event.target).attr('class'))) ) {
		
			$('.magazine').turn('page', page[1]);

			toggleThumbnailPanel();
		}
	});

	// Thumbnails
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
			}
		);
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

	magazineResizeViewport();

	$('.magazine').addClass('animated');
}

function isChrome() { // http://code.google.com/p/chromium/issues/detail?id=128488
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

function addPage(page, book) {
	var id, pages = book.turn('pages'),
	element = $('<div />', {});

	// Add the page to the flipbook
	if (book.turn('addPage', element, page)) {
		// Add the initial HTML
		// It will contain a loader indicator and a gradient
		element.html('<div class="gradient"></div><div class="loader"></div>');
		// Load the page
		loadPage(page, element);
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
	img.attr('src', '../resources/pages/' +  page + '.png');

	loadRegions(page, pageElement);
}

// Load regions
function loadRegions(page, element) {
	$.getJSON(('../resources/regions/'+page+'-regions.json'),
		function(data) {
			$.each(data, function(key, region) {
				addRegion(page, region, element);
			});
		}
	);
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

// decode URL Parameters
function decodeParams(data) {
	var parts = data.split('&'), d, obj = {};
	for (var i =0; i<parts.length; i++) {
		d = parts[i].split('=');
		obj[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
	}
	return obj;
}

// Set the width and height for the viewport
function magazineResizeViewport() {
	var deviceWidth = $(window).width(),
		deviceHeight = $(window).height(),
		options = $('.magazine').turn('options'),
		pageWidth = options.width/2,
		pageHeight = options.height,
		responsiveViewTreshold = 768,
		currPage = $('.magazine').turn('page');

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
				viewScale = 0.75 * boundScale / (pageScale * 0.65);
			} else {
				viewScale = 1;
			}
			
			$('.magazine').turn('size', 2*viewScale*boundWidth, viewScale*boundHeight);
			$('#magazineContainer').css({height: 1.2*viewScale*boundHeight});
			$('.magazine').css({top: 0.1*viewScale*boundHeight});

			$('.next-button').css({backgroundPosition: '-3.5vw'});
			$('.previous-button').css({backgroundPosition: '-3.5vw'});
		}
		else
		{
			if (boundScale < pageScale * 2) {
				viewScale = 0.75 * boundScale / (2 * pageScale * 0.80);
			} else {
				viewScale = 1;
			}

			$('.magazine').turn('size', viewScale*boundWidth, viewScale*boundHeight);
			$('#magazineContainer').css({height: 1.2*viewScale*boundHeight});
			$('.magazine').css({top: 0.1*viewScale*boundHeight});

			$('.next-button').css({backgroundPosition: '-3.5vw'});
			$('.previous-button').css({backgroundPosition: '-3.5vw'});
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

	resizeViewport();
}

function addThumb() {
	var t = 1;
	var appendReg = document.getElementById('container');
	
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
			}).attr('src', '../resources/pages/'+t+'.png');
			thumbnailImg.appendTo(thumbnail);
		}
		else {
			var thumbnail = $('<li />', {'class': 'd-inline'});
			thumbnail.appendTo(thumbPanel);
			var thumbnailImg = $('<img />', {'class': "page-" + t});
			thumbnailImg.css({
				width: '76px', height: '100px'
			}).attr('src', '../resources/pages/' + t + '.png');
			thumbnailImg.appendTo(thumbnail);
			t++;
			var thumbnailImg = $('<img />', {'class': "page-" + t});
			thumbnailImg.css({
				width: '76px', height: '100px'
			}).attr('src', '../resources/pages/' + t + '.png');
			thumbnailImg.appendTo(thumbnail);
		}
		t++;
	}
}

function toggleThumbnailPanel() {
	var deviceWidth = $(window).width(),
	responsiveViewTreshold = 768;

	if (deviceWidth > responsiveViewTreshold) {
		if ($("#thumbnails-panel").css("display") === "none") {
			$("#thumbnails-panel").css({
				top: 'calc(1.5*var(--top-panel-height))',
				display: "inline-flex",
				width: 'var(--thumbnail-panel-width)',
				height: $("#magazineContainer").css("height")
			});
			$("#thumbnails-panel-list").css({
				left: 'calc(var(--thumbnail-panel-width)/2 - 76px)'
			});
			$('.magazine').css({
				marginLeft: parseInt($("#thumbnails-panel").css("width"))/2
			});
			$("#thumbBtn").attr("class", 'fa fa-close');
			$("#magazineControls").css({paddingLeft: "var(--thumbnail-panel-width)"});
		} else {
			$("#thumbnails-panel").css({display: "none"});
			$('.magazine').css({
				marginLeft: 0
			});
			$("#thumbBtn").attr("class", 'fa fa-image');
			$("#magazineControls").css({paddingLeft: "0.5em"});
		}
	} else {
		if ($("#thumbnails-panel").css("display") === "none") {
			$("#thumbnails-panel-list").css({
				left: 'calc(50% - 76px)'
			});
			$("#thumbnails-panel").css({
				width: '100vw',
				top: 'var(--top-panel-height)',
				display: "inline-flex",
				height: $("#magazineContainer").css("height")
			});
			$("#thumbBtn").attr("class", 'fa fa-close');
		} else {
			$("#thumbnails-panel").css({
				display: "none"
			});
			$("#thumbBtn").attr("class", 'fa fa-image');
		}
	}
}

function loadMagazineMenu() {
	var magazineControls = $("#magazineControls"),
	magazineControlsSpan = $("#magazineControlsSpan"),
	deviceWidth = $(window).width(),
	responsiveViewTreshold = 768;
	magazineControlsSpan.remove();

	var spanControlsMenu = $('<span id="magazineControlsSpan" class="" style=""/>');

	var controlsMenu = $(' \
	<a title="Thumbnails" style="height:calc(0.5*var(--top-panel-height));display:inline-flex;align-items:center;" class="top-share" onClick="toggleThumbnailPanel()"> \
	<i id="thumbBtn" style="display:inline-flex;align-items:center;" class="fa fa-image"/></a> \
	<a title="Download" style="height:calc(0.5*var(--top-panel-height));display:inline-flex;align-items:center;" class="top-share" onClick="downloadPDF()"> \
	<i id="downloadPDF" style="display:inline-flex;align-items:center;" class="fa fa-download"/></a> \
	<a title="Mute" style="height:calc(0.5*var(--top-panel-height));display:inline-flex;align-items:center;" class="top-share" onClick="toggleMuteSound()"> \
	<i id="muteButton" style="display:inline-flex;align-items:center;" class="fas fa-volume-up"/></a> \
	');
	controlsMenu.appendTo(spanControlsMenu);
	spanControlsMenu.appendTo(magazineControls);
	
	if (deviceWidth <= responsiveViewTreshold) {
		magazineControls.css({
			top: 'calc(var(--top-panel-height) + 0.5em)'
		})
	}
	addThumb();
}

function downloadPDF() {
	window.open(magazineConsts.pdfURL)
}

function toggleMuteSound() {
	var audioElement = document.getElementById("audio");
	
	if (audioElement.muted === true) {
		audioElement.muted = false;
		$("#muteButton").attr("class", "fas fa-volume-up");
	} else {
		audioElement.muted = true;
		$("#muteButton").attr("class", "fas fa-volume-mute");
	}
}

function loadMagazineEditions() {
	$.getJSON(domain + '/magazine/magazine.json', function (data) {
		$.each(data, function(key, magazineIssues) {
			$("#magazineGridContainerImage").attr("src", magazineIssues[(magazineIssues.length-1)]["src"]+"?rect=686,0,2724,3901&auto=format");
			$(' \
			<div id="" class="content-sc-masthead-magazineMastheadContent"> \
				<cat-ul itemscope="" itemtype="https://schema.org/BreadcrumbList" class="Breadcrumbs-style__Breadcrumbs-sc-c18595ac-0 magazineMasterCategory"> \
					<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="magazineMasterCategoryList"> \
						<a size="3" weight="2" font-family="Tex Gyre Termes" appearance="primary" itemprop="item" class="Link-style__Link-sc-1ce34e85-0 magazineMasterCategoryItem" href="#"> \
							<span itemprop="name">'+magazineIssues[(magazineIssues.length-1)]["issue"]+' Issue</span> \
						</a> \
					</li> \
				</cat-ul> \
				<h1 size="5" class="magazineMastheadTitle" style="margin: 0;">TheHiMJournal: '+magazineIssues[(magazineIssues.length-1)]["title"]+'</h1> \
				<cat-ul itemscope="" itemtype="https://schema.org/BreadcrumbList" class="Breadcrumbs-style__Breadcrumbs-sc-c18595ac-0 magazineMasterCategory"> \
					<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="magazineMasterCategoryList"> \
						<a size="3" weight="2" font-family="Tex Gyre Termes" appearance="primary" itemprop="item" class="Link-style__Link-sc-1ce34e85-0 magazineMasterCategoryItem" href="#"> \
							<span itemprop="name">'+magazineIssues[(magazineIssues.length-1)]["edition"]+'</span> \
						</a> \
					</li> \
				</cat-ul> \
				<h2 size="1" class="magazineMastheadExcerpt" style="margin: 2em 0;">To receive the most inspiring conversations of Mindsalike about luxurious fashion brands, unique accessories, expert health advice and great offers from The HiM Club every Friday.</h2> \
			</div> \
			<!-- style="font-family: Bebas Neue Cyrillic; font-size: 1.3em" --> \
			<button size="3" class="masthead-sc-readNowButton" style="grid-column-start: 1; grid-column-end: span 1;width: 50%;" onclick="window.location.href=\'html5viewer.html\'" type="button">Read Now</button> \
			').appendTo("#magazineGridContainerDescription");
			
			for (let issue = (magazineIssues.length - 1); issue >= 0; issue--) {
				$('.magazineCarousel-container-section-content-fGszeN').slick('unslick');
				$(' \
				<div style="width: 399px;"> \
					<div class="magazineCarousel-container-section-content-card-qwbsz"> \
						<a size="3" class="Thumbnail-style__Thumbnail-sc-c7b97573-0 gFMdkt" href="'+magazineIssues[issue]["download"]+'"><img decoding="async" sizes="(max-width: 640px) 410px, 820px" src="'+magazineIssues[issue]["src"]+'" style="inset: 0px; height: 100%; object-fit: cover; position: absolute; width: 100%;"></a><div class="Meta-style__Meta-sc-a03d2c67-0 dLpoZD"><span class="Meta-style__Date-sc-a03d2c67-1 dGfbVg">'+magazineIssues[issue]["edition"]+'</span></div><h2 size="2" class="Heading-style__Heading-sc-f8030099-0 HaNMq">HiM Journal '+magazineIssues[issue]["issue"]+' Edition</h2><p size="1" class="Paragraph-style__Paragraph-sc-a88fe7e1-0 dBBxwU">'+magazineIssues[issue]["title"]+'</p><a size="1" weight="2" font="Cera" appearance="primary" class="Link-style__Link-sc-1ce34e85-0 jzcUGy" href="'+magazineIssues[issue]["download"]+'">Download Now <svg aria-hidden="true" focusable="false" data-prefix="fat" data-icon="angle-right" class="svg-inline--fa fa-angle-right fa-2x " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M269.7 250.3c3.1 3.1 3.1 8.2 0 11.3l-176 176c-3.1 3.1-8.2 3.1-11.3 0s-3.1-8.2 0-11.3L252.7 256 82.3 85.7c-3.1-3.1-3.1-8.2 0-11.3s8.2-3.1 11.3 0l176 176z"></path></svg></a> \
					</div> \
				</div> \
				').appendTo("#magazineCarouselRow");
				$('.magazineCarousel-container-section-content-fGszeN').slick({
					centerMode: true,
					centerPadding: '0px',
					slidesToShow: 1,
					variableWidth: true,
					draggable: true,
					infinite: true
				});
			}
		});
	});
}