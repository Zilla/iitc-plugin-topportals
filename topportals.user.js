// ==UserScript==
// @id             iitc-plugin-topportals@Zilla
// @name           iitc: TopPortals
// @version        0.2
// @namespace      https://github.com/breunigs/ingress-intel-total-conversion
// @updateURL      https://raw.github.com/Zilla/iitc-plugin-topportals/master/topportals.user.js
// @downloadURL    https://raw.github.com/Zilla/iitc-plugin-topportals/master/topportals.user.js
// @description    Shows the top-AP portals for the area
// @include        https://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// ==/UserScript==


function wrapper()
{
    // Ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function')
	window.plugin = function() {};
    
    // Plugin namespace
    window.plugin.topPortals = function() {};
    
    window.plugin.topPortals.setup = function() {
	// Add topportal area to sidebar
	$('#sidebar').append('<div id="portaltoplist" style="min-height: 240px; color: #ffce00; font-size: 13px; padding: 4px 2px;"></div>');

	// Add settings area to sidebar
	$('#sidebar').append('<div id="toplistsettings" style="min-height: 20px; color: #ffce00; font-size: 13px; padding: 4px 2px;"></div>');
	setupSettingsArea();
	
	window.addHook('portalAdded', window.plugin.topPortals.onPortalAdded);

	showTeams[TEAM_ENL] = true;
	showTeams[TEAM_RES] = true;
    }

    // Called at start of script
    var setup = function() {
	window.plugin.topPortals.setup();
    }

    var topportals = [];
    var showTeams = [];

    function addPortalForTopList(portal)
    {
	var guid = portal.guid;
	var team = portal.team;
	var d    = portal.details;
	var killAP = window.getAttackApGain(d);
	
	var lat = d.locationE6.latE6;
	var lng = d.locationE6.lngE6;
	var perma = 'onclick="window.zoomToAndShowPortal(\'' + guid + '\',[' + lat/1E6 + ',' + lng/1E6 + '])" class="help"';
	var name = d.portalV2.descriptiveText.TITLE;
	
	topportals[guid] = {
	    score: killAP.totalAp,
	    link: perma,
	    name: name,
	    team: team
	};
    }
    
    window.plugin.topPortals.drawPortalTopList = function()
    {
	var htstr = "<p>Portal kill AP:</p><div style=\"display: table;\">";
	var sortarr = [];
	var idx = 0;
	for(i in topportals)
	{
	    if( showTeams[topportals[i].team] == true )
		sortarr[idx++] = topportals[i];
	}
	sortarr.sort(function(a,b) {
	    if( a.score < b.score ) return 1;
	    if( a.score > b.score ) return -1;
	    return 0; });
	for( i = 0; i < sortarr.length && i < 10; i++ )
	{
	    htstr += "<a style=\"display: table-row;\" " + sortarr[i].link + "\">";
	    htstr += "<span style=\"display: table-cell;\">" + sortarr[i].score + ":</span>";
	    htstr += "<span style=\"display: table-cell; padding: 2px;\"></span>";
	    htstr += "<span class=\"" + (sortarr[i].team == TEAM_ENL ? "enl" : "res")  + "\" style=\"display: table-cell;\">" + sortarr[i].name + "</span></a>";
	}
	htstr += "</div>";
	$('#portaltoplist').html(htstr);
    }
    
    window.plugin.topPortals.onPortalAdded = function(obj) {
	addPortalForTopList(obj.portal.options);
	
	 window.plugin.topPortals.drawPortalTopList();
    }

    function setupSettingsArea()
    {

	var htstr = "";
	htstr += "<input type='checkbox' style='height: 13px; vertical-align: middle' checked onChange='window.plugin.topPortals.toggleRes(this);'> <span class=\"res\">Resistance </span>";
	htstr += "<input type='checkbox' style='height: 13px; vertical-align: middle' checked onChange='window.plugin.topPortals.toggleEnl(this);'> <span class=\"enl\">Enlightened </span>";
//	htstr += "<p><input type='radio' name='aptype' style='height: 13px; vertical-align: middle; background: transparent;' checked> Total AP ";
//	htstr += "<input type='radio' name='aptype' style='height: 13px; vertical-align: middle; color: #ffce00;'> Kill AP</p>";
	$('#toplistsettings').html(htstr);
    }

    window.plugin.topPortals.toggleRes = function(cb)
    {
	showTeams[TEAM_RES] = cb.checked;
	window.plugin.topPortals.drawPortalTopList();
    }

    window.plugin.topPortals.toggleEnl = function(cb)
    {
	showTeams[TEAM_ENL] = cb.checked;
	window.plugin.topPortals.drawPortalTopList();
    }
        
    if(window.iitcLoaded && typeof setup === 'function') {
	setup();
    } else {
	if(window.bootPlugins)
	    window.bootPlugins.push(setup);
	else
	    window.bootPlugins = [setup];
    }
} // wrapper end


// Inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);