# DALL · House: Dall·E (and other models)-powered toys for VS Code

This is an extension for the sophisticated, attractive, and intelligent user who wants to look at cool pictures while they use VS Code.

> **NEW**: Nano Banana (Gemini 2.5 Flash Image) is now supported! Set the `dallHouse.imageModel` setting, enter your API key when prompted, and try it out! (For now an OpenAI API key is also required.)

<p align="center">
  <img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/7.png?raw=true">
</p>

It has three features: a GitHub Copilot Chat `@dall-e` participant, a clock, and a picture generated from your current git branch name.

## Setup

1. Install extension and log into GitHub Copilot Chat.
2. Invoke `@dall-e` with an image generation prompt.
3. Enter your own OpenAI API key when prompted
   1. Run "Clear API Key" if you need to change it
4. See cool picture!

To enable the clock and branch image, see the `dallHouse.*.enabled` settings.

Also be sure to configure your API spending limit. DALL·House tries to avoid making too many API requests. It will only update the image when its view is visible, and only when you have been opening or editing files- ie when you are actively using the VS Code window. By default, the clock only updates every 3 minutes, see `dallHouse.clock.updatePeriod` to change this. But you are responsible for monitoring your API usage and paying Sam.

> **Tip**: See the generated prompts in the "Dall Clock Log" output channel or by hovering the image.

## Chat

<table>
  <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-house/blob/fc46dbea7bbe895446c4f5ac1e2edf2d0ae98fdb/samples/chat/1.png?raw=true"></td>
    <td><img src="https://github.com/roblourens/vscode-dall-house/blob/fc46dbea7bbe895446c4f5ac1e2edf2d0ae98fdb/samples/chat/2.png?raw=true"></td>
  </tr>
</table>

## Branch Critter

This is designed to work with VS Code's randomly generated branch names that pair a random adjective with a random animal. But it will pick up any branch name that fits the format `foo-bar` or `rob/foo-bar`.

<table>
  <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/1.png?raw=true"></td>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/2.png?raw=true"></td>
  </tr>
   <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/393b27342019ba759ff420e04ca86df426899da4/samples/branch-critter/10.png?raw=true"></td>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/bfb1445771ac26180ece836a84d49bb037328372/samples/branch-critter/9.png?raw=true"></td>
  </tr>
  <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/3.png?raw=true"></td>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/4.png?raw=true"></td>
  </tr>
   <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/01b8c5a99941335ff8a66d2419c53117b3b6b21d/samples/branch-critter/8.png?raw=true"></td>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/6.png?raw=true"></td>
  </tr>
  <tr>
    <td><img src="https://github.com/roblourens/vscode-dall-clock/blob/6768b235370a8db96243f95bfcec367a24382289/samples/branch-critter/5.png?raw=true"></td>
  </tr>
</table>

## Dall Clock

<p align="center">
  <img src="https://github.com/roblourens/vscode-dall-clock/blob/2ba587b3e9e9fbca8316e21250ee3c9caba338b5/samples/12.png?raw=true">
</p>

Be sure to configure `dallHouse.clock.location` for maximum personalization. DALL·Clock will generate images based in that location.

<p align="center">
  <img src="https://github.com/roblourens/vscode-dall-clock/blob/2ba587b3e9e9fbca8316e21250ee3c9caba338b5/samples/13.png?raw=true">
</p>
<p align="center">
  <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/1.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/3.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/11.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/5.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/10.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/6.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/7.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/8.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/14.png?raw=true">
</p>
<p align="center">
   <img src="https://github.com/roblourens/vscode-dall-clock/blob/bc022c7d8155d638dc29767e07e2a341cdc99385/samples/9.png?raw=true">
</p>
