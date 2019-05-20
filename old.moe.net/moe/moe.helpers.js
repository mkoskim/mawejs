//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Editor settings
//-----------------------------------------------------------------------------

var moe = function()
{
    let src  = document.currentScript.src;
    let file = src.split('/').pop();
    let dir  = src.replace('/'+file,"/");
    
    return { src: src, dir: dir, file: file };
}();

//*****************************************************************************
//
// Loading more elementes
//
//*****************************************************************************

function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- This is the key
        success: function () { },
        error: function () { throw new Error("Could not load script: " + script); }
    });
}

var load = {
    css: function(file)
    {
        $('head').append('<link rel="stylesheet" type="text/css" href="' + file + '">');
    },
    html: function(file)
    {
        let result = "";
        $.ajax({
            url: file,
            async: false,           // <-- This is the key
            success: function (html) { result = html; },
            error: function () { throw new Error("Could not load page: " + file); }
        });
        return result;
    },
    script: require,
};

//*****************************************************************************
//
// Parse queries
//
//*****************************************************************************

function parseQuery(url)
{
    let query = url.replace(/^[^\?]+\??/,'');
    
    let Params = new Object ();
    if (!query) return Params;
    
    let Pairs = query.split(/[;&]/);
    for(let i = 0; i < Pairs.length; i++ )
    {
        let KeyVal = Pairs[i].split('=');
        if(!KeyVal || KeyVal.length != 2 ) continue;
        let key = unescape( KeyVal[0] );
        let val = unescape( KeyVal[1] );
        val = val.replace(/\+/g, ' ');
        Params[key] = val;
    }
    return Params;
}

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

$.fn.exists = function () {
    return this.length !== 0;
}

function autoheight(selector)
{
    selector.on("input", function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        //console.log(this);
    });
}

function showhide(elements, state)
{
    if(state) {
        //elements.show();
        elements.removeClass("hidden");
        elements.trigger("input");
    } else {
        //elements.hide();
        elements.addClass("hidden");
        //elements.css({"display": "none"});
    }
}

function statline(s)
{
    let stat = $("#statline");
    stat.html(s).fadeIn(0).stop();
    stat.fadeOut({ queue: false, duration: 3000 });
}

function key(event)
{
    name = event.key;
    if(event.shiftKey && event.key != "Shift"   ) name = "Shift-" + name;
    if(event.altKey   && event.key != "Alt"     ) name = "Alt-"   + name;
    if(event.ctrlKey  && event.key != "Control" ) name = "Ctrl-"  + name;
    return name;
}

