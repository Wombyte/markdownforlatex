# Development-Journey
1. [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
    * list of required frameworks (Node.js, Git, Yeoman, VsCodeExtensionGenerator)
    * generation of HelloWorld-Extension (alert "HelloWorld" on Command)
    * (Debugging)

---
# Ideas
* [Complete Example](https://github.com/svaberg/SWMF-grammar) including highlighter, outline, breadcrumbs and code snippets

---
# Common Tasks
#### Create a new Command
#### Profile
Aim: Run Typescript-Code on Command "Custom Command"
Involved Files: `extension.ts`, `package.json`

#### Process
1. register command in `activate()` in `extension.ts`
```{typescript}
let renderImages = vscode.commands.registerCommand('helloworld.commandname', () => {
	// do something
})
context.subscriptions.push(renderImages)
```
1. add command to `activationEvents` in `package.json`
```{javascript}
"activationEvents": [
    ...
	"onCommand:helloworld.commandname"
],
```
1. bind Name "Command Name" to id `commandname`. Add to `contributions` > `commands`
```{javascript}
{
	"command": "helloworld.commandname",
	"title": "Hello World: Render Images"
}
```

##### Remarks
* the common string `helloworld.commandname` links all steps. It can be freely selectable but must be unique
* it is recommanded to write the name of the extension in front of the command name in the third step, to let the user find the command faster

---
# Solved Problems