# givtcp-power-flow-card

> **⚠ WARNING: VERY MUCH IN ALPHA STAGE**
While basic functionality is working this is still very much alpha, there are settings in the config UI that are not yet implimented and some basic settings are still missing.


[home-assistant](home-assistant.io) power flow card for [GivTCP](https://github.com/britkat1980/giv_tcp) users.

![demo](https://user-images.githubusercontent.com/19427540/229890939-59a5e358-dcbc-4ce8-a756-159b4ceb3b63.gif)


# Requirements
You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) intergrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).
You must have both the HA_AUTO_D (Home Assistant Auto Discovery) and MQTT_OUTPUT options enabled.

# HACS-Installation
1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inisde home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/VeniVidiVici/givtcp-power-flow-card in the Repository box and select Lovelace for the Category.
4. install the givtcp-power-flow-card using the UI
