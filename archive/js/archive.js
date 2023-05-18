function loadArchive() {
    const elementShelf = document.getElementsByClassName("shelf-img");
    const elementThumb = document.getElementsByClassName("thumb");
	var responsiveViewTreshold = 768;
    var deviceWidth = $(window).width();
    
    if (deviceWidth <= responsiveViewTreshold) {
        for (let s = 0; s < elementShelf.length; s++) {
            elementShelf[s].style.marginTop = "-0.2em"
        }
        for (let t = 0; t < elementThumb.length; t++) {
            elementThumb[t].style.width = "15vw"
        }
    } else {
        for (let s = 0; s < elementShelf.length; s++) {
            elementShelf[s].style.marginTop = "-0.75em"
        }
        for (let t = 0; t < elementThumb.length; t++) {
            elementThumb[t].style.width = "8vw"
        }
    }
}

window.addEventListener('resize', function() {
    loadArchive();
});

window.onscroll = function() {scroll()};

function scroll() {
	var footer = document.getElementsByTagName('footer');
	var footerDiv = footer[0].getElementsByTagName('div');
	var footerSpan = footerDiv[0].getElementsByTagName('span');
	var scrollBottomEl = document.getElementById('scrollToBottom');
	var scrollToTopElement = footerSpan[0].getElementsByTagName('i');
	var scrollToTopIcon = footerSpan[0].getElementsByTagName('a');
	var scrollToTop = $('<i title="Scroll to Top" style="float: right; padding: 1em 1em 1em 0.25em !important; margin: 1em 1em 1em 0.25em !important; color: #FFC71F; cursor: pointer; align-items: center; transform: translateY(5%); font-size: min(max(12px, 2vw), 18px)" class="fa fa-angle-double-up" id="scrollTopIc" onClick="scrollToTop()"></i> \
	<a title="Scroll to Top" style="float: right; padding: 1em 0.25em 1em 1em !important; margin: 1em 0.25em 1em 1em !important; color: #FFC71F; font: min(max(12px, 2vw), 18px) Bebas Neue Cyrillic; cursor: pointer; align-items: center;" id="scrollTopEl" onClick="scrollToTop()">BACK TO TOP</a>');
	
	if (document.scrollTop > 10 || document.documentElement.scrollTop > 10) {
		for (let s = 0; s < scrollToTopElement.length; s++) {
			scrollToTopElement[s].remove();
			scrollToTopIcon[s].remove();
		}
		scrollToTop.appendTo(footerSpan[0]);
		scrollBottomEl.style.display = "none";
	} else if ($(window).height() >= $(document).height()) {
		for (let s = 0; s < scrollToTopElement.length; s++) {
			scrollToTopElement[s].remove();
			scrollToTopIcon[s].remove();
		}
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