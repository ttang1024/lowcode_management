const ace = require('ace-builds');
ace.define('ace/theme/vscode-dark', ['require', 'exports', 'module', 'ace/lib/dom'], function(require, exports, _module) {
  'use strict';
  exports.isDark = true;
  exports.cssClass = 'ace-vscode-dark';
  exports.cssText = `.ace-vscode-dark .ace_gutter {
    background: transparent;
}
.ace-vscode-dark {
    background-color: #1f1f1f;
    color: #abb2bf;
}
.ace-vscode-dark .ace_gutter-cell {
    color: #6e7681;
}
.ace-vscode-dark .ace_rparen,
.ace-vscode-dark .ace_lparen {
    color: #179fff;
}
.ace-vscode-dark .ace_marker-layer .ace_active-line {
    border:2px solid #282828;
}
.ace-vscode-dark .ace_marker-layer .ace_selection {
    background: #3e4451;
}
.ace-vscode-dark.ace_multiselect .ace_selection.ace_start {
    box-shadow: 0 0 3px 0px #1e1e1e;
    border-radius: 2px;
}
.ace-vscode-dark .ace_marker-layer .ace_step {
    background: rgb(198, 219, 174);
}
.ace-vscode-dark .ace_marker-layer .ace_bracket {
    margin: -1px 0 0 -1px;
    border: 1px solid #8f8f8f;
}
.ace-vscode-dark .ace_marker-layer .ace_active-line-layer {
    background: rgba(2, 4, 5, 0.35);
}
.ace-vscode-dark .ace_marker-layer .ace_selected-word {
    border: 1px solid #3e4451;
}
.ace-vscode-dark .ace_invisible {
    color: #404040;
}
.ace-vscode-dark .ace_keyword {
    color: #c678dd;
}
.ace-vscode-dark .ace_entity.ace_other.ace_attribute-name {
    color: #abb2bf;
}
.ace-vscode-dark .ace_indent-guide {
    background: transparent;
}
.ace-vscode-dark .ace_entity.ace_name.ace_function {
    color: #61afef;
}
.ace-vscode-dark .ace_variable {
    color: #9cdcfe;
}
.ace-vscode-dark .ace_constant.ace_language {
    color: #d19a66;
}
.ace-vscode-dark .ace_constant.ace_numeric {
    color: #b5cea8;
}
.ace-vscode-dark .ace_constant.ace_character.ace_entity {
    color: #56b6c2;
}
.ace-vscode-dark .ace_constant.ace_character.ace_other {
    color: #56b6c2;
}
.ace-vscode-dark .ace_support.ace_function {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_class {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_type {
    color: #61afef;
}
.ace-vscode-dark .ace_storage.ace_type {
    color: #61afef;
}
.ace-vscode-dark .ace_invalid {
    color: #ffffff;
    background-color: #ff3333;
}
.ace-vscode-dark .ace_invalid.ace_deprecated {
    color: #ffffff;
    background-color: #ff3333;
}
.ace-vscode-dark .ace_string {
    color: #ce9178;
}
.ace-vscode-dark .ace_string.ace_regexp {
    color: #98c379;
}
.ace-vscode-dark .ace_string.ace_regexp.ace_multiline {
    color: #98c379;
}
.ace-vscode-dark .ace_constant.ace_character {
    color: #98c379;
}
.ace-vscode-dark .ace_comment {
    font-style: italic;
    color: #5c6370;
}
.ace-vscode-dark .ace_meta {
    color: #abb2bf;
}
.ace-vscode-dark .ace_meta.ace_tag {
    color: #abb2bf;
}
.ace-vscode-dark .ace_markup.ace_heading {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_list {
    color: #e5c07b;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_1 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_2 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_3 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_4 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_5 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading.ace_6 {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_heading {
    color: #61afef;
}
.ace-vscode-dark .ace_markup.ace_list.ace_number {
    color: #d19a66;
}
.ace-vscode-dark .ace_markup.ace_list.ace_bullet {
    color: #e5c07b;
}
.ace-vscode-dark .ace_support.ace_function {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_class {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_type {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_constant {
    color: #61afef;
}
.ace-vscode-dark .ace_support.ace_other {
    color: #61afef;
}
.ace-vscode-dark .ace_variable.ace_other {
    color: #e06c75;
}
.ace-vscode-dark .ace_variable.ace_parameter {
    color: #e06c75;
}`;
  exports.$id = 'ace/theme/vscode-dark';
  const dom = require('../lib/dom');
  dom.importCssString(exports.cssText, exports.cssClass, false);
});

(function() {
  ace.require(['ace/theme/vscode-dark'], function(m) {
    if (typeof module == 'object' && typeof exports == 'object' && module) {
      module.exports = m;
    }
  });
})();