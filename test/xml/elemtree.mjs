import { createElem, createText } from "../../src/document/xmljs/elemutil.js";
import { isObject } from "../../src/util/generic.js";

export function createTestTree() {

  //---------------------------------------------------------------------------

  let act_id = 0
  let chapter_id = 0
  let scene_id = 0

  //---------------------------------------------------------------------------

  return createElem("story", {}, [
    createElem("head", {}, [
      createElem("title", {}, [createText("Title")]),
      { type: "comment", comment: "scene" },
    ]),
    createElem("draft", {}, [
      { type: "instruction", name: "act", instruction: "ignore" },
      act([
        chapter([scene({visible: true}, "First"), scene("Second")]),
        chapter([scene("Third")]),
      ]),
      { type: "instruction", name: "scene", instruction: "ignore" },
      act([chapter({visible: true}, [scene({visible: true}, "Fourth")])]),
    ]),
    createElem("notes", {}, [
      act([chapter([scene("Fifth")])]),
    ]),
    createElem("extras", {}, [
      act([chapter([scene("Sixth")])]),
      createElem("sample", {id: "empty"}),
      createElem("sample", {id: "empty-text"}, [createText("")]),
      createElem("sample", {id: "whitespace"}, [createText(" \t Padded text \n")]),
      createElem("sample", {id: "text-parts"}, [
        createText(" Left "), createText(" Right "),
      ]),
      createElem("sample", {id: "non-text"}, [
        { type: "comment", comment: "Not document text" },
        { type: "instruction", name: "text", instruction: "Not document text" },
      ]),
    ]),
    createText("Text"),
  ]);

  //---------------------------------------------------------------------------

  function act(elements = []) {
    act_id = act_id + 1
    return createElem("act", {id: `a${act_id}`}, elements);
  }

  function chapter(elements = [], extra) {
    const [attributes, content = []] = isObject(elements) ? [elements, extra] : [{}, elements]
    chapter_id = chapter_id + 1
    //console.log("Chapter:", chapter_id, "Attr:", attributes, "Content:", content)
    return createElem("chapter", {id: `c${chapter_id}`, ...attributes}, content);
  }

  function scene(text, extra) {
    const [attributes, content] = isObject(text) ? [text, extra] : [{}, text]
    scene_id = scene_id + 1
    //console.log("Scene:", scene_id, "Attr:", attributes, "Content:", content)
    return createElem("scene", {id: `s${scene_id}`, ...attributes}, [createText(content)]);
  }
}
