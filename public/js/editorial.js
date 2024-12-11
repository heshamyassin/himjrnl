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
var startJsonARTICLE = 1, endJsonARTICLE = 9;

function loadArticle() {
	initializeMagazine();
	
	// Import and Load Category Articles
	importCategory();
	
	// Load Content from JSON
	loadContent();
	
	// Resize Viewport
	$(window).resize(function() {
		articleResizeViewport();
	}).bind('orientationchange', function() {
		articleResizeViewport();
	});
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function loadContent() {
	var path = window.location.pathname,
	documentName = path.split("/").slice(-1).toString().replace(".html", ""),
	wpFeatContent = document.getElementById("wp_featured_content"),
	wpBodyContent = document.getElementById("content-sc-articleBody-row"),
	articleCategory = document.getElementById("articleCategory"),
	mastheadTitle = document.getElementById("Heading-sc-mastheadTitle"),
	mastheadExcerpt = document.getElementById("Heading-sc-mastheadExcerpt"),
	audioPlayer = document.getElementById("audioPlayer"),
	shopRow = document.getElementById("content-sc-shop-bucxaf"),
	furtherReadingsGrid = document.getElementById("content-sc-furtherReading-postGrid-cVDKJX");
	
	$(' \
	<div class="content-sc-col-single"> \
		<h2 id="mastheadDividerExcerpt">Written by: HiM</h2> \
	</div> \
	\
	<a title="Share" style="display:inline-flex;align-items:center;" class="content-share" onClick="shareBTN()"> \
	<i id="shareBtn" style="width:1em;" class="fas fa-share-alt"></i></a> \
	\
	<div class="content-sc-col-double"> \
		<hr /> \
	</div> \
	').appendTo("#mastheadDividerShare");
	
	readTextFile(documentName + ".json", function(JSONfile){
		var JSONcontent = JSON.parse(JSONfile);
		
		articleCategory.innerHTML = JSONcontent["category"] + " ";
		mastheadTitle.innerHTML = JSONcontent["title"];
		mastheadExcerpt.innerHTML = JSONcontent["excerpt"];
		
		switch (JSONcontent["featuredContent"][0]["class"]) {
			case "image":
				var wpFeatContentImg = $('<img alt="" style="width: 100%;" />', {id:"", class:""});
				wpFeatContentImg.attr({"src": JSONcontent["featuredContent"][0]["src"]}).appendTo(wpFeatContent);
			break;
			case "instagram-feed":
				var instagramBlock = $('<iframe ></iframe><script async src="lib/instagram.js" charset="utf-8"></script>', {'id': 'myInstagram', 'class': 'instagram-feed'});
				instagramBlock.attr({"src": JSONcontent["featuredContent"][0]["src"]}).appendTo(wpFeatContent);
			break;
			case "instagram-media":
				var instagramBlock = $('<blockquote class="instagram-media" data-instgrm-version="14" data-instgrm-permalink='+JSONcontent["featuredContent"][0]["src"]+'></blockquote><script async src="lib/instagram.js" charset="utf-8"></script>', {'id': 'myInstagram', 'class': 'instagram-media'});
				instagramBlock.appendTo(wpFeatContent);
			break;
			case "gif":
				var gifPlayer = $('<img />',  {id:"", class:""});
				gifPlayer.attr({"src": JSONcontent["featuredContent"][0]["src"]}).appendTo(wpFeatContent);
			break;
			case "video":
				var videoPlayer = $('<video controls autoplay loop allow="accelerometer; encrypted-media; gyroscope; picture-in-picture;"/>',  {id:"", class:""});
				videoPlayer.attr("src", JSONcontent["featuredContent"][0]["src"]).appendTo(wpFeatContent);
			break;
			case "iframe":
				var videoPlayer = $('<iframe allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/>',  {id:"", class:""});
				videoPlayer.attr({"src": JSONcontent["featuredContent"][0]["src"]+"?autoplay=1"}).appendTo(wpFeatContent);
			break;
			case 'twitter-tweet':
				var twitterBlock = $('<blockquote class="twitter-tweet"><a href='+JSONcontent["featuredContent"][0]["src"]+'></a></blockquote><script async src="lib/twitter.js" charset="utf-8"></script>', {'id': '', 'class': 'twitter-tweet'});
				twitterBlock.appendTo(wpFeatContent);
			break;
			case 'twitter-timeline':
				var twitterBlock = $('<a class="twitter-timeline" data-height="500" data-theme="light" href='+JSONcontent["featuredContent"][0]["src"]+'></a><script async src="lib/twitter.js" charset="utf-8"></script>', {'id': "", 'class': "twitter-timeline"});
				twitterBlock.appendTo(wpFeatContent);
			break;
		}

		// Add TLDR Summary
		for (let summary = 0; summary < JSONcontent["summary"].length; summary++) {
			$('<li>'+JSONcontent["summary"][summary]+'</li>').appendTo("#content-sc-summaryTLDR-row");
		}
		
		// Create a new instance and load the wavesurfer
		if (JSONcontent["featuredContent"][1]["src"] === "") {
			audioPlayer.style.display = "none";
		} else {
			wavesurfer.load(JSONcontent["featuredContent"][1]["src"]);
		}

		// Hide Content in case of Members-Only, otherwise show publicly
		if (JSONcontent["membersOnly"] === "true" && membersOnlyActivated === false) {
			loadArticleContent(3, JSONcontent, wpBodyContent);

			shopRow.remove();
		} else if (JSONcontent["membersOnly"] === "false" || membersOnlyActivated === true) { 
			loadArticleContent(JSONcontent["wp_content"].length, JSONcontent, wpBodyContent);

			if (JSONcontent["wp_product"].length >= 3) {
				for (let shopProduct = 0; shopProduct < JSONcontent["wp_product"].length; shopProduct++) {
					$(' \
					<div id="shopProduct_'+shopProduct+'" class="content-sc-shop-product-gzPIrH"> \
						<img src="'+JSONcontent["wp_product"][shopProduct]["image"]["src"]+'" alt="'+JSONcontent["wp_product"][shopProduct]["image"]["alt"]+'" decoding="async" sizes="(max-width: 640px) 432px, 864px" style="aspect-ratio: 1 / 1; width: 100%;"> \
						<div> \
							<h2 size="1" style="margin: 0;">'+JSONcontent["wp_product"][shopProduct]["data"]["caption"]+'</h2> \
							<h2 size="1" class="" style="margin: 0; font-size: 1em;">£'+JSONcontent["wp_product"][shopProduct]["data"]["price"]+'</h2> \
						</div> \
						<a href="'+JSONcontent["wp_product"][shopProduct]["link"]+'" type="button" size="1" class="content-sc-shop-productButton-dpcoCr">Buy now</a> \
					</div> \
					').appendTo(shopRow);
				}
			} else {
				shopRow.remove();
			}
		} else {
			/* Do nothing */
		}

		$.getJSON('../'+JSONcontent["category"].replace(/\s/g, '').replace("'", '').toLowerCase()+'.json', function (data) {
			var ARRAY = [];
			$.each(data, function(key, jsonARTICLE) {
				for (let i = 0; i < jsonARTICLE.length; i++) {
					ARRAY.push(JSON.stringify(jsonARTICLE[i]));
				}
			});
			if ((ARRAY.length - 1) >= 3) {
				var furtherARTICLE = true,
				furtherKEY = 0;

				while (furtherARTICLE) {
					if (JSON.parse(ARRAY[furtherKEY])['title'] != JSONcontent['title']) {
						$(' \
						<a class="content-sc-furtherReading-postGrid-postExcerpt-kuccfR" href="'+JSON.parse(ARRAY[furtherKEY])['docref'].split("/").slice(-1).toString().replace(".json", ".html")+'"> \
							<div type="rectangle" size="4" class="content-sc-furtherReading-postGrid-postExcerpt-thumbnail-NrRzK"> \
								<img decoding="async" sizes="(max-width: 640px) 410px, 820px" alt="'+JSON.parse(ARRAY[furtherKEY])['featuredContent'][0]['alt']+'" src="'+JSON.parse(ARRAY[furtherKEY])['featuredContent'][0]['src']+'" style="inset: 0px; height: 100%; object-fit: cover; position: absolute; width: 100%;"> \
							</div> \
							<div class="content-sc-furtherReading-postGrid-postExcerpt-body-gTXfgv"> \
								<div class="content-sc-furtherReading-postGrid-postExcerpt-category-dLpoZD">'+JSON.parse(ARRAY[furtherKEY])['category']+'<span class="content-sc-furtherReading-postGrid-postExcerpt-date-dGfbVg"> — '+checkArticleDATE(JSON.parse(ARRAY[furtherKEY]))+'</span></div> \
								<div class="content-sc-furtherReading-postGrid-postExcerpt-title-kITLCM"> \
									<h2 size="1" class="content-sc-furtherReading-postGrid-postExcerpt-titleHeading-bhRlhf">'+JSON.parse(ARRAY[furtherKEY])['title']+'</h2> \
								</div> \
							</div> \
						</a> \
						').appendTo(furtherReadingsGrid);
					} else {
					}
					(furtherKEY < 3) ? furtherKEY++ : furtherARTICLE = false;
				}
			} else {
				$(".content-sc-furtherReading-row").remove();
			}
		});
	});
}

function loadArticleContent(noContent, JSONcontent, wpBodyContent) {
	let content = [];

	for (let wpContent = 0; wpContent < noContent; wpContent++) {
		switch (JSONcontent["wp_content"][wpContent]["class"]) {
			case "paragraph":
				content.push(' \
				<p id="content-sc-articleBodyContent_'+wpContent+'" class="content-sc-textblock">'+JSONcontent["wp_content"][wpContent]["text"]+'</p> \
				');
				break;
			case "image":
				content.push(' \
				<div id="content-sc-articleBodyContent_'+wpContent+'" class="content-sc-wp_content"> \
					<img alt="'+JSONcontent["wp_content"][wpContent]["alt"]+'" decoding="async" sizes="(max-width: 640px) 1296px, 2592px" src="'+JSONcontent["wp_content"][wpContent]["src"]+'" style="width: 100%;"> \
				</div>	\
				');
				break;
			/******** Load more cases. Copy from Magazine Regions ********/
			case "instagram-feed":
				content.push(' \
				<iframe id="content-sc-articleBodyContent_'+wpContent+'" class="instagram-feed" src="'+JSONcontent["wp_content"][wpContent]["src"]+'"></iframe> \
				<script async src="lib/instagram.js" charset="utf-8"></script> \
				');
				break;
			case "instagram-media":
				content.push(' \
				<blockquote id="content-sc-articleBodyContent_'+wpContent+'" class="instagram-media" data-instgrm-version="14" data-instgrm-permalink='+JSONcontent["wp_content"][wpContent]["src"]+'></blockquote> \
				<script async src="lib/instagram.js" charset="utf-8"></script> \
				');
				break;
			case "gif":
				content.push(' \
				<img id="content-sc-articleBodyContent_'+wpContent+'" class="" src="'+JSONcontent["wp_content"][wpContent]["src"]+'"/> \
				');
				break;
			case "video":
				content.push(' \
				<video id="content-sc-articleBodyContent_'+wpContent+'" class="" controls loop allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" src="'+JSONcontent["wp_content"][wpContent]["src"]+'"/> \
				');
				break;
			case "iframe":
				content.push(' \
				<iframe id="content-sc-articleBodyContent_'+wpContent+'" class="" src="'+JSONcontent["wp_content"][wpContent]["src"]+'?autoplay=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/> \
				');
				break;
			case 'twitter-tweet':
				content.push(' \
				<blockquote id="content-sc-articleBodyContent_'+wpContent+'" class="twitter-tweet"> \
				<a href='+JSONcontent["wp_content"][wpContent]["src"]+'></a> \
				</blockquote> \
				<script async src="lib/twitter.js" charset="utf-8"></script> \
				');
				break;
			case 'twitter-timeline':
				content.push(' \
				<a id="content-sc-articleBodyContent_'+wpContent+'" class="twitter-timeline" data-height="500" data-theme="light" href='+JSONcontent["wp_content"][wpContent]["src"]+'></a> \
				<script async src="lib/twitter.js" charset="utf-8"></script> \
				');
				break;
		}
	}

	content.push(showSubscribeRow());
	
	wpBodyContent.innerHTML += content.join('');
}

function showSubscribeRow() {
	return '<div size="2" class="show-subscribe-row-joqnTx"> \
		<div size="2" class="show-subscribe-row-content-jsxoGA"> \
			<div class="show-subscribe-row-content-col-kDJFWl"> \
				<h2 size="3" class="show-subscribe-row-titleHeading-dZQaLi" style="margin-block-start: 0; margin-bottom: 0 !important;">Read this story and all the inspiring stories on TheHiM.</h2> \
				<p style="margin-block-start: 0; margin-block-end: 0; text-align: center; padding: 0 6em !important; color: #111F4A;">The author made this story available to TheHiM members only. Join our club to instantly unlock this story plus other member-only benefits.</p> \
				<ul style="margin-block-start: 0; \
				margin-block-end: 0;" class="show-subscribe-row-content-benefits-jYhbHp"> \
					<li class="show-subscribe-row-content-benefits-items-iRxVOF"> \
						<div class="show-subscribe-row-content-benefits-items-points-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>TheHiM Journal twice a year \
					</li> \
					<li class="show-subscribe-row-content-benefits-items-iRxVOF"> \
						<div class="show-subscribe-row-content-benefits-items-points-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Your own TheHiM Club membership card \
					</li> \
					<li class="show-subscribe-row-content-benefits-items-iRxVOF"> \
						<div class="show-subscribe-row-content-benefits-items-points-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Paywalled content: access to members-only curated content \
					</li> \
					<li class="show-subscribe-row-content-benefits-items-iRxVOF"> \
						<div class="show-subscribe-row-content-benefits-items-points-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Exclusive brand offers \
					</li> \
					<li class="show-subscribe-row-content-benefits-items-iRxVOF"> \
						<div class="show-subscribe-row-content-benefits-items-points-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Invites to private TheHiM Club events \
					</li> \
				</ul> \
				<button size="3" class="show-subscribe-row-subscribe-button" onclick="goToLogin()" type="button">Subscribe Now</button> \
			</div> \
		</div> \
	</div>';
}

function shareBTN() {
	const shareData = {
		title: document.title,
		url: domain,
	};
	
	navigator.share(shareData);
}

function prepareCategoryFeaturedContent(jsonARTICLE) {
	$("#categoryHome-grid-container-featureContent").empty();
	
	const reference = domain + '/' + jsonARTICLE[0]['docref'].replace(".json", ".html");
	const categoryLink = jsonARTICLE[0]['category'].replace(/\s/g, '').replace("'", '').toLowerCase();
	
	$(' \
		<cat-ul itemscope="" itemtype="https://schema.org/BreadcrumbList" class="Breadcrumbs-style__Breadcrumbs-sc-c18595ac-0 magazineMasterCategory"> \
			<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="magazineMasterCategoryList"> \
				<a size="3" weight="2" font-family="Tex Gyre Termes" appearance="primary" itemprop="item" class="Link-style__Link-sc-1ce34e85-0 magazineMasterCategoryItem" href="'+domain+"/editorial/"+categoryLink+"/"+categoryLink+'.html"> \
					<span id="categoryHomeFeatureCategory" itemprop="name">'+jsonARTICLE[0]['category']+'</span> \
				</a> \
			</li> \
		</cat-ul> \
		<h1 size="5" id="categoryHomeFeatureTitle" class="magazineMastheadTitle" style="margin: 0; color: white;">'+jsonARTICLE[0]['title']+'</h1> \
		<h2 size="1" id="categoryHomeFeatureExcerpt" class="magazineMastheadExcerpt" style="margin: 2em 0; color: white; margin-block-start: 0.3em; margin-block-end: 0.3em;">'+jsonARTICLE[0]['excerpt']+'</h2> \
		<cat-ul itemscope="" itemtype="https://schema.org/BreadcrumbList" class="Breadcrumbs-style__Breadcrumbs-sc-c18595ac-0 magazineMasterCategory"> \
			<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="magazineMasterCategoryList"> \
				<a size="3" weight="2" font-family="Tex Gyre Termes" appearance="primary" itemprop="item" class="Link-style__Link-sc-1ce34e85-0 magazineMasterCategoryItem" href="'+reference+'"> \
					<span itemprop="name">READ MORE</span> \
				</a> \
				<svg aria-hidden="true" focusable="false" data-prefix="fat" data-icon="angle-right" class="svg-inline--fa fa-angle-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"> \
					<path fill="currentColor" d="M269.7 250.3c3.1 3.1 3.1 8.2 0 11.3l-176 176c-3.1 3.1-8.2 3.1-11.3 0s-3.1-8.2 0-11.3L252.7 256 82.3 85.7c-3.1-3.1-3.1-8.2 0-11.3s8.2-3.1 11.3 0l176 176z"></path> \
				</svg> \
				<meta itemprop="position" content="1"> \
			</li> \
		</cat-ul> \
	').appendTo("#categoryHome-grid-container-featureContent");

	/** Update Photo **/
	$(' \
	<div style="opacity: 1;"> \
		<picture style="bottom:0;height:100%;left:0;position:absolute;right:0;top:0;width:100%"> \
			<img alt="'+jsonARTICLE[0]['featuredContent'][0]['alt']+'" src="'+jsonARTICLE[0]['featuredContent'][0]['src']+'"> \
		</picture> \
	</div> \
	').appendTo('#categoryHomeFeatureBackground');
}

function importCategory() {
	var path = window.location.pathname,
	documentName = path.split("/").slice(-1).toString().replace(".html", "");

	const magazineAdvertise = $(' \
	<!-- Category Articles from JS --> \
	<div id="magazineAdvertise" style="aspect-ratio: auto !important; padding: 2em; background-color: #F9F0E6; color: #111F4A; \
	width: 100% !important; grid-column-start: 1; grid-column-end: span 3; grid-row-start: 3; grid-row-end: span 3;" \
	class="magazine-grid-container"> \
		<img id="magazineGridContainerImage" alt="TheHiMJournal Latest Edition" decoding="async" sizes="(max-width: 768px) 1000px, 2000px"> \
		<div id="magazineGridContainerDescription" class="magazine-grid-container-description" style="-webkit-box-align: start; align-items: flex-start;"> \
			<!-- Category Magazine from JS --> \
		</div> \
	</div> \
	');

	const HiMClubAdvertise = $(' \
	<div size="2" style="background-color: #111F4A; \
	grid-column-start: 1; \
	grid-column-end: span 3; \
	grid-row-start: 8; \
	grid-row-end: span 3;" class="advertising-sc-row-joqnTx"> \
		<div size="2" class="advertising-sc-content-jsxoGA"> \
			<div class="advertising-sc-bgImage-gXZMSp" style="grid-column-start: 1 col-start; \
			grid-column-end: span 1;"> \
				<img alt="Sign up to our newsletter" decoding="async" sizes="(max-width: 768px) 1000px, 2000px" src="https://cdn.sanity.io/images/vxy259ii/production/1185bd7ec6095fdd21aba9ccddd57fa3d72d1d8c-1707x2560.jpg"> \
			</div> \
			<div class="advertising-sc-content-col-kDJFWl" style="grid-column-start: 2 col-start; \
			grid-column-end: span 1; \
			margin: 0 auto 0 0 !important; \
			width: 100% !important;"> \
				<h2 size="3" class="advertising-sc-content-col-titleHeading-dZQaLi" style="color: #F9F0E6; margin-block-start: 0; margin-bottom: 0 !important;">HiM Club Membership Benefits</h2> \
				<ul style="margin-block-start: 0; \
				margin-block-end: 0; \
				row-gap: 16px;" class="advertising-sc-clubOverviewGrid-jYhbHp"> \
					<li class="advertising-sc-clubOverviewGrid-iRxVOF"> \
						<div class="advertising-sc-clubOverviewGrid-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>TheHiM Journal twice a year \
					</li> \
					<li class="advertising-sc-clubOverviewGrid-iRxVOF"> \
						<div class="advertising-sc-clubOverviewGrid-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Your own TheHiM Club membership card \
					</li> \
					<li class="advertising-sc-clubOverviewGrid-iRxVOF"> \
						<div class="advertising-sc-clubOverviewGrid-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Paywalled content: access to members-only curated content \
					</li> \
					<li class="advertising-sc-clubOverviewGrid-iRxVOF"> \
						<div class="advertising-sc-clubOverviewGrid-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Exclusive brand offers \
					</li> \
					<li class="advertising-sc-clubOverviewGrid-iRxVOF"> \
						<div class="advertising-sc-clubOverviewGrid-cVwzaR"> \
							<svg aria-hidden="true" focusable="false" data-prefix="fasr" data-icon="arrow-right" class="svg-inline--fa fa-arrow-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> \
								<path fill="currentColor" d="M429.8 273l17-17-17-17L276.2 85.4l-17-17-33.9 33.9 17 17L354.9 232 24 232 0 232l0 48 24 0 330.8 0L242.2 392.6l-17 17 33.9 33.9 17-17L429.8 273z"></path> \
							</svg> \
						</div>Invites to private TheHiM Club events \
					</li> \
				</ul> \
				<button size="3" class="masthead-sc-readNowButton" style="width: 50%; \
				grid-column-start: 1; grid-column-end: span 1; \
				background-color: #F9F0E6; \
				color: #111F4A;" onclick="" type="button">Subscribe Now</button> <!-- onclick="goToLogin()" --> \
			</div> \
		</div> \
	</div> \
	');

	$.getJSON(documentName+'.json', function (data) {
		$.each(data, function(key, jsonARTICLE) {
			jsonARTICLE = sortEditorialArticles(jsonARTICLE);
			
			if (jsonARTICLE.length >= startJsonARTICLE && jsonARTICLE.length <= endJsonARTICLE) {
				loadCategory(jsonARTICLE, startJsonARTICLE, jsonARTICLE.length);
				
				$("#categoryLoadMoreBtn").css({display: 'none'});

				$("#magazineAdvertise").remove();

				magazineAdvertise.appendTo("#category-sc-furtherReading-postGrid-cVDKJX");

				loadHiMClub(true);
			} else if (jsonARTICLE.length > endJsonARTICLE) {
				loadCategory(jsonARTICLE, startJsonARTICLE, endJsonARTICLE);
				
				$("#categoryLoadMoreBtn").css({display: 'inline-block'});
				
				$("#magazineAdvertise").remove();

				magazineAdvertise.appendTo("#category-sc-furtherReading-postGrid-cVDKJX");

				loadHiMClub(true);

				HiMClubAdvertise.appendTo("#category-sc-furtherReading-postGrid-cVDKJX");
			} else {
				/* Do Nothing */
			}
		});
	});
}

function loadCategory(jsonARTICLE, startJsonARTICLE, endJsonARTICLE) {
	// Load Category Home Latest Article into Featured Row
	prepareCategoryFeaturedContent(jsonARTICLE);
		
	for (let article = (startJsonARTICLE-1); article < endJsonARTICLE; article++) {
		
		var reference = domain + '/' + jsonARTICLE[article]['docref'].replace(".json", ".html");

		$(' \
		<a class="content-sc-furtherReading-postGrid-postExcerpt-kuccfR" href="'+reference+'"> \
			<div type="rectangle" size="4" class="content-sc-furtherReading-postGrid-postExcerpt-thumbnail-NrRzK"> \
				<img decoding="async" sizes="(max-width: 640px) 410px, 820px" alt="'+jsonARTICLE[article]['featuredContent'][0]['alt']+'" src="'+jsonARTICLE[article]['featuredContent'][0]['src']+'" style="inset: 0px; height: 100%; object-fit: cover; position: absolute; width: 100%;"> \
			</div> \
			<div class="content-sc-furtherReading-postGrid-postExcerpt-body-gTXfgv"> \
				<div class="content-sc-furtherReading-postGrid-postExcerpt-category-dLpoZD">'+jsonARTICLE[article]['category']+'<span class="content-sc-furtherReading-postGrid-postExcerpt-date-dGfbVg"> — '+checkArticleDATE(jsonARTICLE[article])+'</span></div> \
				<div class="content-sc-furtherReading-postGrid-postExcerpt-title-kITLCM"> \
					<h2 size="1" class="content-sc-furtherReading-postGrid-postExcerpt-titleHeading-bhRlhf">'+jsonARTICLE[article]['title']+'</h2> \
				</div> \
			</div> \
		</a> \
		').appendTo("#category-sc-furtherReading-postGrid-cVDKJX");
	}
}

function loadMoreCategory() {
	var tmp = endJsonARTICLE - startJsonARTICLE + 1;
	startJsonARTICLE = endJsonARTICLE+1, endJsonARTICLE += tmp;
	importCategory();
}

// Set the width and height for the viewport
function articleResizeViewport() {
	var deviceWidth = $(window).width(),
	responsiveViewTreshold = 768,
	waveform = document.getElementById("waveform"),
	waveformWave = waveform.getElementsByTagName("wave");

	if (deviceWidth <= responsiveViewTreshold) {
		waveformWave[0].style.height = "3em";
	} else {
		waveformWave[0].style.height = "5em";
	}

	resizeViewport();
}