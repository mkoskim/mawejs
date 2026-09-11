//*****************************************************************************
//
// Test flattened document conversions for various formats
//
//*****************************************************************************

import {describe, test, it} from "node:test"
import assert from "node:assert/strict";

import { convertText, convertNode } from "../../src/document/export/process.js";
import { getTextConverter } from "../../src/document/export/convert2TXT.js";
import { getHTMLConverter } from "../../src/document/export/convert2HTML.js";
import { getRTFConverter } from "../../src/document/export/convert2RTF.js";
import { getTEXConverter } from "../../src/document/export/convert2TEX.js";

//-----------------------------------------------------------------------------
// Converters
//-----------------------------------------------------------------------------

const format_md = getTextConverter({format: "md"})
const format_html = getHTMLConverter()
const format_rtf = getRTFConverter()
const format_tex = getTEXConverter()

//*****************************************************************************
//
// Test text generation (including tests for escaping for certain formats)
//
//*****************************************************************************

describe("Text conversion", () => {

  test("Basic text", () => {

    it("Converts undefined text to empty string", () => {
      const node = []
      test("MD", () => assert.equal(convertText(format_md, node), ""));
      test("HTML", () => assert.equal(convertText(format_html, node), ""));
      test("RTF", () => assert.equal(convertText(format_rtf, node), ""));
      test("TeX", () => assert.equal(convertText(format_tex, node), ""));
    })

    it("Converts text node to string", () => {
      const node = [{text: "Text"}]
      test("MD", () => assert.equal(convertText(format_md, node), "Text"));
      test("HTML", () => assert.equal(convertText(format_html, node), "Text"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "Text"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "Text"));
    })

    it("Combines text elements", () => {
      const node = [{text: "A"}, {text: "B"}, {text: "C"}]
      test("MD", () => assert.equal(convertText(format_md, node), "ABC"));
      test("HTML", () => assert.equal(convertText(format_html, node), "ABC"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "ABC"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "ABC"));
    })

    it("Escapes text correctly", () => {
      const node = [{text: '\\{}&%$#_~^"<>\'|', bold: true, italic: true}]
      test("HTML", () => assert.equal(convertText(format_html, node),
        '<i><b>\\{}&amp;%$#_~^&quot;&lt;&gt;&#39;|</b></i>'));
      test("RTF", () => assert.equal(convertText(format_rtf, node),
        String.raw`{\i {\b \\\{\}&%$#_~^"<>'|}}`));
      test("TeX", () => assert.equal(convertText(format_tex, node),
        String.raw`\textit{\textbf{{\textbackslash}\{\}\&\%\$\#\_{\textasciitilde}{\textasciicircum}{\textquotedbl}{\textless}{\textgreater}'{\textbar}}}`));
    })

    it("Preserves Unicode text", () => {
      const node = [{text: 'ä “龍” 😀'}]
      test("MD", () => assert.equal(convertText(format_md, node), 'ä “龍” 😀'));
      test("HTML", () => assert.equal(convertText(format_html, node), 'ä “龍” 😀'));
      test("TeX", () => assert.equal(convertText(format_tex, node), 'ä “龍” 😀'));
      test("RTF", () => assert.equal(convertText(format_rtf, node),
        String.raw`\u228? \u8220?\u-24691?\u8221? \u-10179?\u-8704?`));
    })

    it("Converts bold text", () => {
      const node = [{text: "Text", bold: true}]
      test("MD", () => assert.equal(convertText(format_md, node), "**Text**"));
      test("HTML", () => assert.equal(convertText(format_html, node), "<b>Text</b>"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "{\\b Text}"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "\\textbf{Text}"));
    })

    it("Converts italic text", () => {
      const node = [{text: "Text", italic: true}]
      test("MD", () => assert.equal(convertText(format_md, node), "_Text_"));
      test("HTML", () => assert.equal(convertText(format_html, node), "<i>Text</i>"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "{\\i Text}"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "\\textit{Text}"));
    })
  })
})

//*****************************************************************************
//
// Test cases for paragraph conversions. Text generation is already tested.
// When exporting, we like to separate paragraphs by indentation, but we don't
// want to indent the first paragraph. HTML can handle this with CSS, MD does
// not like have spaces at the beginning of the line. RTF and TeX need manual
// indentation.
//
// Quotations (quote) are more like "pre-formatted" text, and do not use first
// logic.
//
//*****************************************************************************

describe("Paragraph (first) conversion", () => {

  it("Converts p to string", () => {
    const node = {type: "p", text: "Text", first: true}
    test("MD", () => assert.equal(convertNode(format_md, node), "Text\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<p>Text</p>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{Text\\par}"));
    test("TeX", () => assert.equal(convertNode(format_tex, node), "\\noindent Text\n"));
  })

  it("Converts missing to string", () => {
    const node = {type: "missing", text: "Text", first: true}
    test("MD", () => assert.equal(convertNode(format_md, node), "!! Text\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), '<p class="missing">Text</p>'));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\cf2 Text\\par}"));
    test("TeX", () => assert.equal(convertNode(format_tex, node), "{\\noindent\\color{red}Text}\n"));
  })
})

describe("Paragraph (non-first) conversion", () => {

  it("Converts p to string", () => {
    const node = {type: "p", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), "Text\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<p>Text</p>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\fi567 Text\\par}"));
    test("TeX", () => assert.equal(convertNode(format_tex, node), "Text\n"));
  })

  it("Converts missing to string", () => {
    const node = {type: "missing", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), "!! Text\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), '<p class="missing">Text</p>'));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\fi567\\cf2 Text\\par}"));
    test("TeX", () => assert.equal(convertNode(format_tex, node), "{\\color{red}Text}\n"));
  })

  it("Converts quote to string", () => {
    const node = {type: "quote", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), "> Text\n>"));
    test("HTML", () => assert.equal(convertNode(format_html, node), '<blockquote>Text</blockquote>'));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\li1134\\ri1134 Text\\par}"));
    test("TeX", () => assert.equal(convertNode(format_tex, node), "{Text\\par}\n"));
  })
})

//*****************************************************************************
//
// Test prefix (and later title) escaping
//
//*****************************************************************************

describe("Header prefix escaping", () => {

  it("Escapes special characters in prefix", () => {
    const node = {
      type: "scene", header: "numbered", number: 1,
      prefix: String.raw`<>&"'\{}%$#_~^|`,
    }

    test("MD", () => assert.equal(convertNode(format_md, node),
      String.raw`#### <>&"'\{}%$#_~^| 1` + "\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node),
      String.raw`<h4>&lt;&gt;&amp;&quot;&#39;\{}%$#_~^| 1</h4>`));
    test("RTF", () => assert.equal(convertNode(format_rtf, node),
      String.raw`{\sb480\b <>&"'\\\{\}%$#_~^| 1\par}`));
    // TeX content (literal file text, not a JS string):
    //   {\textless}{\textgreater}\&{\textquotedbl}'{\textbackslash}\{\}\%\$\#\_{\textasciitilde}{\textasciicircum}{\textbar} 1
  })
})

//*****************************************************************************
//
// Test header generation (none, separated, etc)
//
//*****************************************************************************

//-----------------------------------------------------------------------------
//
// Header generation uses various node attributes, but not all use everything.
// Here are the basic cases based on header type (node.header):
//
// none      - returns undefined, nothing is generated
// break     - returns format-specific break
// separated - First returns undefined, non-first separator (* * *)
// numbered  - if node has number, returns `${prefix} ${number}` -style
//             header. If node is unnumbered (number == undefined), returns
//             header with name.
// named     - returns header with node text
// numbered&named - If node has number, combines "prefix+number" + ". " + name.
//          If node has not number, returns named header.
//
//-----------------------------------------------------------------------------

describe("Header generation", () => {

  it("Converts br to break", () => {
    const node = {type: "br", header: "break"}
    test("MD", () => assert.equal(convertNode(format_md, node), "&nbsp;\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<br/>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\fi567\\par}"));
  })

  //---------------------------------------------------------------------------

  it("Converts header='none' to undefined", () => {
    const node = {type: "chapter", header: "none"}
    test("MD", () => assert.equal(convertNode(format_md, node), undefined));
    test("HTML", () => assert.equal(convertNode(format_html, node), undefined));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), undefined));
  })

  //---------------------------------------------------------------------------

  it("Converts separated headers", () => {
    const header = "separated"

    it("First separated", () => {
      const node = {type: "scene", header, first: true}
      test("MD", () => assert.equal(convertNode(format_md, node), undefined));
      test("HTML", () => assert.equal(convertNode(format_html, node), undefined));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), undefined));
    })

    it("Non-first separated", () => {
      const node = {type: "scene", header}
      test("MD", () => assert.equal(convertNode(format_md, node), "#### * * *\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), '<div class="separator">* * *</div>'));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\qc * * *\\par}"));
    })
  })

  //---------------------------------------------------------------------------
  // Test header row formatting with header=named. It should produce a header
  // line and we can control the content. Insert number and prefix to ensure
  // that they are not added.
  //---------------------------------------------------------------------------

  function testNamedAct(header, fields) {
    const node = {type: "act", header, ...fields}
    test("MD", () => assert.equal(convertNode(format_md, node), "## Name\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<h2>Name</h2>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\qc\\b\\fs32 Name\\par}"));
  }

  function testNamedChapter(header, fields) {
    const node = {type: "chapter", header, ...fields}
    test("MD", () => assert.equal(convertNode(format_md, node), "### Name\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<h3>Name</h3>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\b\\fs28 Name\\par}"));
  }

  function testNamedScene(header, fields) {
    const node = {type: "scene", header, ...fields}
    test("MD", () => assert.equal(convertNode(format_md, node), "#### Name\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node), "<h4>Name</h4>"));
    test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\b Name\\par}"));
  }

  //---------------------------------------------------------------------------

  it("Converts named headers", () => {
    const header = "named"

    it("Act", () => testNamedAct(header, {text: "Name", prefix: "Prefix", number: 3}))
    it("Chapter", () => testNamedChapter(header, {text: "Name", prefix: "Prefix", number: 15}))
    it("Scene", () => testNamedScene(header, {text: "Name", prefix: "Prefix", number: 145}))
  })

  //---------------------------------------------------------------------------
  // Test header row formatting with header=numbered. Prefix is added before
  // number.
  //---------------------------------------------------------------------------

  it("Converts numbered headers", () => {
    const header = "numbered"

    test("Act", () => {
      const node = {type: "act", header, text: "Name", prefix: "Prefix", number: 3}
      test("MD", () => assert.equal(convertNode(format_md, node), "## Prefix 3\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h2>Prefix 3</h2>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\qc\\b\\fs32 Prefix 3\\par}"));
    })

    test("Chapter", () => {
      const node = {type: "chapter", header, text: "Name", prefix: "Prefix", number: 15}
      test("MD", () => assert.equal(convertNode(format_md, node), "### Prefix 15\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h3>Prefix 15</h3>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\b\\fs28 Prefix 15\\par}"));
    })

    test("Scene", () => {
      const node = {type: "scene", header, text: "Name", prefix: "Prefix", number: 145}
      test("MD", () => assert.equal(convertNode(format_md, node), "#### Prefix 145\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h4>Prefix 145</h4>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\b Prefix 145\\par}"));
    })
  })

  //---------------------------------------------------------------------------
  // Test header row formatting with header=named&numbered.
  //---------------------------------------------------------------------------

  it("Convert numbered&named headers", () => {
    const header = "numbered&named"
    test("Act", () => {
      const node = {type: "act", header, text: "Name", prefix: "Prefix", number: 3}
      test("MD", () => assert.equal(convertNode(format_md, node), "## Prefix 3. Name\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h2>Prefix 3. Name</h2>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\qc\\b\\fs32 Prefix 3. Name\\par}"));
    })

    test("Chapter", () => {
      const node = {type: "chapter", header, text: "Name", prefix: "Prefix", number: 15}
      test("MD", () => assert.equal(convertNode(format_md, node), "### Prefix 15. Name\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h3>Prefix 15. Name</h3>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\sa480\\b\\fs28 Prefix 15. Name\\par}"));
    })

    test("Scene", () => {
      const node = {type: "scene", header, text: "Name", prefix: "Prefix", number: 145}
      test("MD", () => assert.equal(convertNode(format_md, node), "#### Prefix 145. Name\n"));
      test("HTML", () => assert.equal(convertNode(format_html, node), "<h4>Prefix 145. Name</h4>"));
      test("RTF", () => assert.equal(convertNode(format_rtf, node), "{\\sb480\\b Prefix 145. Name\\par}"));
    })
  })

  //---------------------------------------------------------------------------
  // Test, that unnumbered headers fall back to named.
  //---------------------------------------------------------------------------

  test("If header=numbered, unnumbered headers fall back to named", () => {
    const header = "numbered"

    it("Act", () => testNamedAct(header, {text: "Name", prefix: "Prefix"}))
    it("Chapter", () => testNamedChapter(header, {text: "Name", prefix: "Prefix"}))
    it("Scene", () => testNamedScene(header, {text: "Name", prefix: "Prefix"}))
  })

  //---------------------------------------------------------------------------
  // Test, that unnumbered headers fall back to named.
  //---------------------------------------------------------------------------

  test("If header=numbered&named, unnumbered headers fall back to named", () => {
    const header = "numbered&named"

    it("Act", () => testNamedAct(header, {text: "Name", prefix: "Prefix"}))
    it("Chapter", () => testNamedChapter(header, {text: "Name", prefix: "Prefix"}))
    it("Scene", () => testNamedScene(header, {text: "Name", prefix: "Prefix"}))
  })
})
