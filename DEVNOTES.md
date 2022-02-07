# Links and Blogs
## Development-Journey
1. [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
    * list of required frameworks (Node.js, Git, Yeoman, VsCodeExtensionGenerator)
    * generation of HelloWorld-Extension (alert "HelloWorld" on Command)
    * (Debugging)
2. Add [Language Grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
    * How to create a language-extension? (the generated files can merge into an existing extension without causing problems)
    * tiny example for `tmlanguage.json`-grammar
    * Scope Inspector
<br/><br/><br/>

## Related Links
* [Complete Example](https://github.com/svaberg/SWMF-grammar) including highlighter, outline, breadcrumbs and code snippets

<br/><br/><br/><br/>

# Common Tasks
## **Create a new Command**
### <u>Profile</u>
* **Aim**: Run Typescript-Code on Command "Custom Command"
* **Involved Files**: `extension.ts`, `package.json`

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
* the common string `helloworld.commandname` links all steps. It can be freely selectable but must be unique
* it is recommanded to write the name of the extension in front of the command name in the third step, to let the user find the command faster

<br/><br/><br/><br/>

# Solved Problems