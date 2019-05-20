//*****************************************************************************
//
// Sheet represents story as one contiguous sheet. It allows editing
// and restructuring the story.
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Sheet element defaults
//-----------------------------------------------------------------------------

function SheetDefaults(selector)
{
    autoheight(selector.find(".autoheight"))

    if(selector.is("div.scene"))
    {
        selector.keydown(SceneboxKeyDown);
    } else {
        selector.find("div.scene").keydown(SceneboxKeyDown);
    }

    selector.find(".lineedit")
        .keydown(SceneInputKeyDown);
    selector.find(".textedit")
        .keydown(SceneTextareaKeyDown)
        .prop("selectionStart", 0)
        .prop("selectionEnd", 0);

    showhide(selector.find("#synopsis"), $("input#synopses").prop("checked"));
    showhide(selector.find("#sketch"),   $("input#sketches").prop("checked"));
    showhide(selector.find("#content"),  $("input#content").prop("checked"));
}

//*****************************************************************************
//
// Scene edit box & operations
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Create scene edit box
//-----------------------------------------------------------------------------

var scenenum = 1;

function SceneEditBox(scene)
{
    //-------------------------------------------------------------------------
    // Clone box from templates and find the elements
    //-------------------------------------------------------------------------
    
    let scenebox   = $("#template > .scene").clone();

    SheetDefaults(scenebox);

    let descbox    = scenebox.find("#synopsis");
    let sketchbox  = scenebox.find("#sketch");
    let contentbox = scenebox.find("#content");

    //-------------------------------------------------------------------------

    if(scene != undefined) {
        if(scene.name == undefined)
        {
            scene.name = "Scene " + scenenum;
            scenenum = scenenum + 1;
        }

        descbox.html(scene.synopsis);
        sketchbox.html(scene.sketch);
        contentbox.html(scene.content);
    }

    //-------------------------------------------------------------------------

    contentbox.on("keydown", function(event) {
        switch(key(event)) {
            case "Alt-x": sceneSplit(event); break;
        }
    });

    return scenebox;
}

//-----------------------------------------------------------------------------
// Scene split & merge
//-----------------------------------------------------------------------------

function sceneSplit(event)
{
    let contentbox = $(event.target);

    let caret = contentbox.prop("selectionStart");
    let content1 = contentbox.val().slice(0, caret).trim();
    let content2 = contentbox.val().slice(caret, contentbox.val().length).trim();

    if(content1.length == 0 || content2.length == 0) return;

    contentbox.val(content1).trigger("input");

    let scenebox1 = contentbox.parent("div.scene");
    let scenebox2 = SceneEditBox({ content: content2 });
    
    scenebox1.after(scenebox2);
    autoheight(scenebox2.find(".autoheight"));
    scenebox2.find(".autoheight").trigger("input");
    scenebox2.find("#content").focus();
}

//-----------------------------------------------------------------------------

function sceneMerge(event)
{
    let scenebox1  = $(event.target).parent("div.scene");
    let scenebox2  = scenebox1.next();

    if(!scenebox2.exists()) return;

    let descbox = scenebox1.find("#synopsis");
    let contbox = scenebox1.find("#content");
    
    desc    = descbox.val().trim() + "\n\n" + scenebox2.find("#synopsis").val().trim();
    content = contbox.val().trim() + "\n\n" + scenebox2.find("#content").val().trim();

    descbox.val(desc.trim()).trigger("input");
    contbox.val(content.trim()).trigger("input");

    scenebox2.remove();
}

//*****************************************************************************
//
// Sheet & Scene key handlers
//
//*****************************************************************************

function findfocusable(fields, filtering)
{
    return $("#sheet").find(fields).filter(filtering);
}

function movefocus(event, fields, delta)
{
    let focused = $(":focus").get(0);
    let focusable = findfocusable(fields, ":visible");
    let next = focusable.index(focused) + delta;

    if(next >= 0 && next < focusable.length)
    {
        focusable[next].focus();
        event.preventDefault();
        return true;
    }
    return false;
}

function move2any(event, delta)
{
    return movefocus(event, "textarea, input", delta);
}

function move2similar(event, delta)
{
    let focused = $(":focus").get(0);
    if(focused.id && movefocus(event, focused.tagName + "#" + focused.id, delta))
    {
        return true;
    }
    return move2any(event, delta);
}

//-----------------------------------------------------------------------------

function BodyKeyDown(event)
{
    //console.log(this, key(event));
    switch(key(event))
    {
        case "Escape":
        /*
            if($(":focus").length)
            {
                $(":focus").blur();
            } else {
                findfocusable("textarea, input", ":visible:first").get(0).focus();
            }
        */
            console.log($(":focus").get(0));
            break;
    }
}

function SheetKeyDown(event)
{
    switch(key(event)) {
        case "Ctrl-Home": findfocusable("textarea, input", ":visible:first").get(0).focus(); break;
        case "Ctrl-End":  findfocusable("textarea, input", ":visible:last").get(0).focus(); break;

        case "PageUp":    move2similar(event, -1); break;
        case "PageDown":  move2similar(event, +1); break;

        case "Backspace":
        case "ArrowLeft": case "Ctrl-ArrowLeft":
        case "ArrowUp":   case "Ctrl-ArrowUp":
            if(move2any(event, -1)) {
                let focused = $(":focus").get(0);
                let last = focused.value.length;
                focused.selectionStart = last;
                focused.selectionEnd   = last;
            }
            break;

        case "Enter":
        case "ArrowRight": case "Ctrl-ArrowRight":
        case "ArrowDown":  case "Ctrl-ArrowDown":
            if(move2any(event, +1)) {
                let focused = $(":focus").get(0);
                focused.selectionStart = 0;
                focused.selectionEnd   = 0;
            }
            break;
    }
}

function SceneboxKeyDown(event)
{
    switch(key(event))
    {
        case "Alt-g":
            console.log("Grab", this);
            if($(this).hasClass("gu-transit")) {
                $(this).removeClass("gu-transit");
                $("body").removeClass("gu-unselectable");
            } else {
                $(this).addClass("gu-transit");
                $("body").addClass("gu-unselectable");
            }
            break;
        
        case "Alt-m": sceneMerge(event); break;
    }
}

function SceneInputKeyDown(event)
{
    //console.log(key(event));

    switch(key(event))
    {
        case "Backspace":
        case "ArrowLeft": case "Ctrl-ArrowLeft":
            if(this.selectionStart != 0) event.stopPropagation();
            break;
        case "ArrowRight": case "Ctrl-ArrowRight":
            if(this.selectionStart < this.value.length) event.stopPropagation();
            break;
    }
}

function SceneTextareaKeyDown(event)
{
    switch(key(event))
    {
        case "Enter":
            event.stopPropagation();
            break;

        case "PageUp":
        case "PageDown":
            event.preventDefault();
            break;

        case "Backspace":
        case "ArrowLeft": case "Ctrl-ArrowLeft":
        case "ArrowUp":   case "Ctrl-ArrowUp":
            if(this.selectionStart > 0)
            {
                event.stopPropagation();
            }
            break;

        case "ArrowRight": case "Ctrl-ArrowRight":
        case "ArrowDown":  case "Ctrl-ArrowDown":
            if(this.selectionStart < this.value.length)
            {
                event.stopPropagation();
            }
            break;
    }
}

//-----------------------------------------------------------------------------
// Create sheet under root element from story
//-----------------------------------------------------------------------------

function Sheet(root, story)
{
    root.html(load.html(moe.dir + "moe.sheet.html")); 

    //-------------------------------------------------------------------------
    // Apply defaults to preset elements
    //-------------------------------------------------------------------------

    SheetDefaults($("div#sheet"));
    $("body").keydown(BodyKeyDown);
    //$("div#board").keydown(BoardKeyDown);
    $("div#sheet").keydown(SheetKeyDown);

    //-------------------------------------------------------------------------
    // Create scene list
    //-------------------------------------------------------------------------

    let scenelist = $("#scenelist");
    
    if(story.scenes && story.scenes.length) for(let i in story.scenes)
    {
        scenelist.append(SceneEditBox(story.scenes[i]));
    }
    else
    {
        scenelist.append(SceneEditBox());
    }

    //-------------------------------------------------------------------------
    // Hook checkboxes
    //-------------------------------------------------------------------------

    $("input#synopses").on("click", function() {
        showhide($("div#sheet #synopsis"), this.checked);
        $(".autoheight").trigger("input");
    });
    $("input#sketches").on("click", function() {
        showhide($("div#sheet #sketch"), this.checked);
        $(".autoheight").trigger("input");
    });
    $("input#content").on("click", function() {
        showhide($("div#sheet #content"), this.checked);
        $(".autoheight").trigger("input");
    });

    //-------------------------------------------------------------------------
    // Set up drag'n'drop
    //-------------------------------------------------------------------------

    dragula([scenelist[0]], {
        revertOnSpill: true,
        moves: function (el, container, handle)
        {
            return handle.id == "draghandle";
        }
    })
    .on("drag",    function(elem) { $(elem).parent().css({"border-color": "rgb(160, 160, 220)"}); })
    .on("dragend", function(elem) { $(elem).parent().css({"border-color": "transparent"  }); });

    //-------------------------------------------------------------------------
    // Initial focus: It's now always first content box, but maybe it could
    // also be title if it is empty?
    //-------------------------------------------------------------------------

    //let elem = scenelist[0].querySelector("#content");
    //elem.focus();
    //console.log(elem);
}
