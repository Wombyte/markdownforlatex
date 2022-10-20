# Links and Blogs

## Development-Journey

1. [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
    - list of required frameworks (Node.js, Git, Yeoman, VsCodeExtensionGenerator)
    - generation of HelloWorld-Extension (alert "HelloWorld" on Command)
    - (Debugging)
    - [Installation](https://vscode-docs.readthedocs.io/en/stable/extensions/install-extension/)
2. Add [Language Grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
    - How to create a language-extension? (the generated files can merge into an existing extension without causing problems)
    - tiny example for `tmlanguage.json`-grammar \* Scope Inspector
3. [Understand TextMate-Grammar](https://www.apeth.com/nonblog/stories/textmatebundle.html)
    - good explanation (in contrast to the [documentation](https://macromates.com/manual/en/language_grammars)
4. [Understand Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets)

<br/><br/><br/>

## Related Links

-   [Complete Example](https://github.com/svaberg/SWMF-grammar) including highlighter, outline, breadcrumbs and code snippets
-   [Complete Code Example](https://github.com/benawad/vstodo/blob/master/extension/src/extension.ts)

<br/><br/><br/><br/>

# Common Tasks

## **Create a new Command**

### <u>Profile</u>

-   **Aim**: Run Typescript-Code on Command "Custom Command"
-   **Involved Files**: `extension.ts`, `package.json`

</br>

### <u>Process</u>

1. register command in `activate()` in `extension.ts`

```ts
let varcommandname = vscode.commands.registerCommand('helloworld.commandname', () => {
	// do something
})
context.subscriptions.push(varcommandname)
```

2. add command to `activationEvents` in `package.json`

```js
"activationEvents": [
    ...
	"onCommand:helloworld.commandname"
],
```

3. bind Name "Command Name" to id `commandname`. Add to `contributions` > `commands`

```js
{
	"command": "helloworld.commandname",
	"title": "Hello World: Render Images"
}
```

<br/>

### <u>Remarks</u>

-   the common string `helloworld.commandname` links all steps. It can be freely selectable but must be unique
-   it is recommanded to write the name of the extension in front of the command name in the third step, to let the user find the command faster

<br/><br/><br/><br/>

# Solved Problems

## **EsLint and Prettier**

### <u>Wrong EndOfLine-Character</u>

-   **Problem**: Error `Delete 'cr' [prettier/prettier]` at each end of lines
-   **Source**: https://stackoverflow.com/questions/53516594/why-do-i-keep-getting-delete-cr-prettier-prettier
-   **Solution**: Add the following `rules` of `.eslintrc.js`

```js
"prettier/prettier": [
    "error",
    {
        "endOfLine": "auto"
    },
],
```

## VsCode

### <u>Find Theme Files</u>

-   folder: `{user}\AppData\Local\Programs\Microsoft VS Code\resources\app\extensions\theme-defaults\themes`

# Bugs

-   wrong indent "paragraph > img > explanation" (see KogSys)
-   csquotes-package is not imported

# <u>Features</u>

## Lexer

-   allow indented commands (eg \t\t_crimg...)
-   allow note with head and no body
-   allow files without \_startdocument
-   add working directory and short pdf links
-   add simple math syntax to decrease braces
    -   `V_subscript ^superscript` statt `V_{subscript}^{superscript}`
    -   `V*` und `V'` statt `V^*` und `V^\prime`
    -   `alpha` statt `\alpha`

## Latex

## VsCode

-   bracket-indication for \\{\\}
-   snippets for
    -   chapter (#####) with 5 blank lines (section, subsection, ...)
    -   definition
-   integrated latex error messages
    -   for each line (especially for math stuff)
-   Waiting indicator for: create pdf, parse latex, render images
-   prettier for lmd
    -   automatic blank lines for chapter, section, ...
-   collapseable chapter, section, ...
-   outline in treeview

## Gimp

-   selection with lasso

## Softwaretechnik

-   "deploy" to extension folder via git
