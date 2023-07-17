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

	if (region['class'] == 'iframe' || region['class'] == 'video'
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

		/* HYASEIN: Responsiveness */
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
			
			/* HYASEIN: Algorithm */
			/*
				- calculate page center and window center
				- if page turn = right -> translate to right
				- else translate to left
			*/

			//$('.magazine').css({display: "none"});
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
			
			/* HYASEIN: Algorithm */
			/*
				- calculate page(s) center and window center
				- translate back to center
			*/
			
			// $('.magazine').css({display: "block"});
		}

		if (currPage==1)
			$('.magazine').turn('peel', 'br');
		
	}

	var magazineOffset = $('.magazine').offset();
	/*var magazineOffset = $('.magazine').offset(),
		boundH = deviceHeight - magazineOffset.top - $('.magazine').height(),
		marginTop = (boundH - $('.thumbnails > div').height()*viewScale) / 2;

	if (marginTop<0) {
		$('.thumbnails').css({height:1});
	} else {
		$('.thumbnails').css({height: boundH});
		$('.thumbnails > div').css({marginTop: marginTop});
	}*/

	if (magazineOffset.top<$('.made').height())
		$('.made').hide();
	else
		$('.made').show();

	$('.magazine').addClass('animated');
	
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

/* Calculate the width and height of a square within another square

function calculateBound(d) {
	
	var bound = {width: d.width, height: d.height};

	if (bound.width>d.boundWidth || bound.height>d.boundHeight) {
		
		var rel = bound.width/bound.height;

		if (d.boundWidth/rel>d.boundHeight && d.boundHeight*rel<=d.boundWidth) {
			
			bound.width = Math.round(d.boundHeight*rel);
			bound.height = d.boundHeight;

		} else {
			
			bound.width = d.boundWidth;
			bound.height = Math.round(d.boundWidth/rel);
		
		}
	}
		
	return bound;
} */