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

	$.getJSON('resources/regions/'+page+'-regions.json').
		done(function(data) {

			$.each(data, function(key, region) {
				addRegion(region, element);
			});
		});
}

// Add region

function addRegion(region, pageElement) {
	
	var reg = $('<div />', {'id': 'region-'+region['class'], 'class': 'region '+region['class']}),
		options = $('.magazine').turn('options'),
		pageWidth = options.width/2,
		pageHeight = options.height;

	reg.css({
		top: Math.round(region.y/pageHeight*100)+'%',
		left: Math.round(region.x/pageWidth*100)+'%',
		width: Math.round(region.width/pageWidth*100)+'%',
		height: Math.round(region.height/pageHeight*100)+'%'
	}).attr('region-data', $.param(region.data||''));

	reg.appendTo(pageElement);
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

function processRegion(region, regionType) {

	var data = decodeParams(region.attr('region-data'));

	switch (regionType) {
		case 'link' :
			window.open(data.url);
		break;
		case 'video':
			var videoPlayer = $('<video controls />', {'id': 'myVideo', 'class': ''});
			document.getElementById("region-video").style.opacity = '1';
			videoPlayer.css({
				top: 'region.y',
				left: 'region.x',
				width: '100%',
				height: '94%'
			}).attr('src', data.url);
			videoPlayer.appendTo(region);
			document.getElementById("myVideo").style.opacity = '1';
		break;
		case 'iframe':
			var videoPlayer = $('<iframe />', {'id': 'myiframe', 'class': ''});
			document.getElementById("region-iframe").style.opacity = '1';
			videoPlayer.css({
				top: 'region.y',
				left: 'region.x',
				width: '100%',
				height: '94%'
			}).attr('src', data.url);
			videoPlayer.appendTo(region);
			document.getElementById("myiframe").style.opacity = '1';
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
				viewScale = 0.90 * boundScale / (pageScale * 0.80);
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
				viewScale = 0.90 * boundScale / (2 * pageScale * 0.80);
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