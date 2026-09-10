//*****************************************************************************
//
// Test flattened document conversions for various formats
//
//*****************************************************************************

import {describe, test, it} from "node:test"
import assert from "node:assert/strict";

import { convertText, convertNode, convertFlatted } from "../../src/document/export/processDoc.js";
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
// Test cases for text (including tests for escaping for certain formats)
//
//*****************************************************************************

describe("Text conversion", () => {

  test("Basic text", () => {

    it("Converts text node to string", () => {
      const node = [{text: "Text"}]
      test("MD", () => assert.equal(convertText(format_md, node), "Text"));
      test("HTML", () => assert.equal(convertText(format_html, node), "Text"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "Text"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "Text"));
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

    it("Combines text elements", () => {
      const node = [{text: "Text"}, {text: "A"}]
      test("MD", () => assert.equal(convertText(format_md, node), "TextA"));
      test("HTML", () => assert.equal(convertText(format_html, node), "TextA"));
      test("RTF", () => assert.equal(convertText(format_rtf, node), "TextA"));
      test("TeX", () => assert.equal(convertText(format_tex, node), "TextA"));
    })
  })
})

//*****************************************************************************
//
// Test cases for paragraphs
//
//*****************************************************************************

describe("Paragraph conversion", () => {

  it("Converts p to string", () => {
    const node = {type: "p", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), "Text\n"));
  })

  it("Converts quote to string", () => {
    const node = {type: "quote", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), "> Text\n>"));
  })
})

//*****************************************************************************
//
// Test cases for headers
//
//*****************************************************************************

describe("Header conversion", () => {

  it("Converts numbered act with special characters in prefix", () => {
    const node = {
      type: "act", header: "numbered", number: 1,
      prefix: String.raw`<>&"'\{}%$#_~^|`,
      text: "This name must not appear",
    }

    test("MD", () => assert.equal(convertNode(format_md, node),
      String.raw`# <>&"'\{}%$#_~^| 1` + "\n"));
    test("HTML", () => assert.equal(convertNode(format_html, node),
      String.raw`<h1>&lt;&gt;&amp;&quot;&#39;\{}%$#_~^| 1</h1>`));

    // MD currently preserves the prefix literally because escape() is a stub.
    // Once RTF/TeX headers exist, test this same node with those converters.
    // Expected heading content is escaped prefix + one space + number, without
    // the node name. Format-specific heading wrappers are still to be decided.
    // RTF content (literal file text, not a JS string):
    //   <>&"'\\\{\}%$#_~^| 1
    // TeX content (literal file text, not a JS string):
    //   {\textless}{\textgreater}\&{\textquotedbl}'{\textbackslash}\{\}\%\$\#\_{\textasciitilde}{\textasciicircum}{\textbar} 1
  })

  it("Escapes HTML numbering prefix", () => {
    assert.equal(convertNode(format_html, {
      type: "chapter", header: "numbered", prefix: "<A&B>", number: 1, text: "Title",
    }), "<h2>&lt;A&amp;B&gt; 1</h2>");
  })

  it("Escapes HTML heading text before adding markup", () => {
    const nodes = [{
      type: "chapter", number: 1,
      children: [{text: '<Anna & Albert>', bold: true}],
    }]
    assert.equal(convertFlatted(format_html, nodes, {
      chapters: "numbered&named", prefix_chapter: "<Luku>",
    }), "<h2>&lt;Luku&gt; 1. <b>&lt;Anna &amp; Albert&gt;</b></h2>");
  })

  it("Converts scene/header=none", () => {
    const node = {type: "scene", header: "none", text: "Text"}
    test("MD", () => assert.equal(convertNode(format_md, node), undefined));
  })
})
