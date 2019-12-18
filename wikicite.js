function Citation(id, rawCitation) {
	this.id = id;
	this.rawCitation = rawCitation;
	this.ref = null;
	
	this.citationText = function(formatter) { return rawCitation; }
}

function FormattedCitation(id, params) {
	this.id = id;
	this.ref = ref;
	
	this.citationText = function(formatter) { return formatter.format(params); }
}

function CitationConfiguration(
	enableCompleteCitationContainer = true,
	completeCitationContainer = "#complete-citation-container",
	completeCitationContainerTitle = "<h2>References</h2>",
	enableHoverContainer = true,
	hoverArrowOffset = 30,
	hoverContainerFadeLength = 50) {
		
	this.completeCitationContainer = completeCitationContainer;
	this.enableCompleteCitationContainer = enableCompleteCitationContainer;
	this.completeCitationContainerTitle = completeCitationContainerTitle;
	this.enableHoverContainer = enableHoverContainer;
	this.hoverArrowOffset = hoverArrowOffset;

}

(function($) {

	var INLINE_CITATION_NAME = "data-inline-citation";
	var LINKED_CITATION_NAME = "data-linked-citation";
	
	var HOVER_CONTAINER_NAME = "citation-hover";
	
	$.fn.cite = function(citations = [], configuration = new CitationConfiguration(), callback) {
		var ce = new _CiteExecute(citations, configuration);
		ce.execute(this);
		
		if (callback != null) {
			callback(ce.usedCitations);
		}
		
		return this;
	}
	
	function _CiteExecute(citations, configuration) {
		this.citations = citations;
		this.configuration = configuration;
		this.usedCitations = []
		
		this.execute = function(el) {
			this.createHover();
			this.processCitations(el);
			this.setupCompleteCitationContainer();
		}
		
		this.processCitations = function (el) {
			var usedCitations = [];
			var usedCitationMap = {};
			var citationCount = 0;
			
			var _this = this;
			
			el.each(function () {
				$(this).find("["+INLINE_CITATION_NAME+"]").each(function() {
					var citation = new Citation(null, $(this).attr(INLINE_CITATION_NAME));
					
					citationCount++;
					citation.ref = citationCount;
					
					usedCitations.push(citation);
					
					_this.setupCitation(this, citation);
				});
				
				$(this).find("["+LINKED_CITATION_NAME+"]").each(function() {
					var citation = _this.findCitation($(this).attr(LINKED_CITATION_NAME));
					
					if (citation == null) return;
					
					if (citation.ref == null) {
						citationCount++;
						citation.ref = citationCount;
					}
					
					if (!(citation.id in usedCitationMap)) {
						usedCitations.push(citation);
						usedCitationMap[citation.id] = 0;
					}
					
					_this.setupCitation(this, citation);
				});
				
				_this.usedCitations = usedCitations;
			});
		}
		
		this.setupCitation = function(el, citation) {
			var _this = this;
			var hoverable;
			if (configuration.enableCompleteCitationContainer) {
				hoverable = $("<a href='#ref"+ citation.ref +"' class='citation-mark'>[" + citation.ref + "]</a>").appendTo(el); 
			} else {
				hoverable = el;
			}
			
			if (configuration.enableHoverContainer) {
				$(hoverable).hover(function() {
					var me = $("#" + HOVER_CONTAINER_NAME);
					
					me.removeClass();
					me.addClass("bottom default");
					
					me.html(citation.citationText());
					me.stop().fadeIn(_this.configuration.hoverContainerFadeLength);
					
					var hoverableOffset = $(this).offset();
					var hoverableHeight = $(this).height();
					var hoverableWidth = $(this).width();
					
					me.css({
						left: hoverableOffset.left - (hoverableWidth / 2) - configuration.hoverArrowOffset,
						top: hoverableOffset.top - me.height() - 33
					});
					
					var bounding = me[0].getBoundingClientRect();
					
					if (bounding.top < 0) {
						me.removeClass("bottom");
						me.addClass("top");
						me.css({
							top: hoverableOffset.top + hoverableHeight + 10
						});
					}
					
					if (bounding.left < 0) {
						me.removeClass("default");
						me.addClass("left");
						me.css({
							left: hoverableOffset.left - (hoverableWidth/2)
						});
					} else if (bounding.right > (window.innerWidth || document.documentElement.clientWidth)) {
						me.removeClass("default");
						me.addClass("right");
						me.css({
							left: hoverableOffset.left - (hoverableWidth*1.5) - me.width()
						});
					}
				}, function() {
					$("#" + HOVER_CONTAINER_NAME).stop().fadeOut(_this.configuration.hoverContainerFadeLength);
				});
			}
		}
		
		this.findCitation = function(id) {
			for (var i = 0; i < citations.length; i++) {
				if (citations[i].id == id) return citations[i];
			}
		}
		
		this.setupCompleteCitationContainer = function() {
			if (!this.configuration.enableCompleteCitationContainer || $(this.configuration.completeCitationContainer).length < 1) {
				return;
			}
			
			var me = $(this.configuration.completeCitationContainer);
			
			me.append(this.configuration.completeCitationContainerTitle);
			var list = $("<ol id='complete-citation-container-list'></ol>").appendTo(me);
			
			console.log(this.usedCitations);
			
			for(citation of this.usedCitations) {
				$(list).append("<li id='ref" + citation.ref + "'>" + citation.citationText() + "</li>");
			}
		}
		
		this.createHover = function() {
			if ($("#" + HOVER_CONTAINER_NAME).length) {
				return;
			}
			
			$("body").append("<div id='citation-hover' class='top left'></div>");
			
			var _this = this;
			
			$("#citation-hover").hover(function() {
				$(this).stop().fadeIn(_this.configuration.hoverContainerFadeLength);
			}, function() {
				$(this).stop().fadeOut(_this.configuration.hoverContainerFadeLength);
			});
		}
	}
	
}( jQuery ));